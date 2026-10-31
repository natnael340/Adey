from __future__ import annotations

import json
import logging
from typing import TYPE_CHECKING

import pydantic
from django.core.exceptions import ImproperlyConfigured, ValidationError
from langchain_core.tools import StructuredTool

if TYPE_CHECKING:
    from adey_apps.rag.models import Chat

logger = logging.getLogger(__name__)

RESERVED_KEYS = {"knowledge"}


class SkillRegistry:
    _classes: dict[str, type[Skill]] = {}

    @classmethod
    def register(cls, skill: type[Skill]) -> None:
        if skill.key in RESERVED_KEYS:
            raise ImproperlyConfigured(f"Skill key {skill.key!r} is reserved.")
        existing = cls._classes.get(skill.key)
        if existing and existing is not skill:
            raise ImproperlyConfigured(f"Skill key {skill.key!r} is already used by {existing.__qualname__}.")
        if skill.default and skill.config_model:
            raise ImproperlyConfigured(f"Default skill {skill.key!r} can't require config.")
        cls._classes[skill.key] = skill

    @classmethod
    def get(cls, key: str) -> type[Skill] | None:
        return cls._classes.get(key)

    @classmethod
    def all(cls) -> dict[str, type[Skill]]:
        return dict(cls._classes)


def config_errors(error: pydantic.ValidationError) -> dict[str, list[str]]:
    errors: dict[str, list[str]] = {}
    for e in error.errors():
        errors.setdefault(".".join(str(part) for part in e["loc"]) or "config", []).append(e["msg"])
    return errors


def validate_skill_config(key: str, config: dict) -> pydantic.BaseModel | None:
    """Raises ValidationError with a {field: [messages]} dict; runs the skill's live verify()."""
    cls = SkillRegistry.get(key)
    if cls is None or not cls.read_only:
        raise ValidationError({"key": [f"Unknown skill {key!r}."]})
    if cls.config_model is None:
        return None
    try:
        validated = cls.config_model.model_validate(config)
    except pydantic.ValidationError as e:
        raise ValidationError(config_errors(e))
    try:
        cls.verify(validated)
    except ValidationError as e:
        raise ValidationError(e.message_dict if hasattr(e, "error_dict") else {"config": e.messages})
    return validated


class Skill:
    """A callable tool for the tool agent. Never store config on the class or in module globals: instances are per bot, per message."""

    key: str = ""
    description: str = ""
    input_schema: dict = {}
    read_only: bool = True
    config_model: type[pydantic.BaseModel] | None = None
    # on for every bot without enrolling; a bot opts out with an inactive ChatSkill row
    default: bool = False

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if cls.key:
            SkillRegistry.register(cls)

    def __init__(self, *, chat: Chat, session_id: str, config: pydantic.BaseModel | None):
        self.chat = chat
        self.session_id = session_id
        self.config = config

    def run(self, **kwargs) -> str | dict:
        raise NotImplementedError

    @classmethod
    def verify(cls, config: pydantic.BaseModel) -> None:
        pass

    @classmethod
    def config_schema(cls) -> dict:
        return cls.config_model.model_json_schema() if cls.config_model else {}

    def as_langchain_tool(self) -> StructuredTool:
        def call(**kwargs) -> str:
            try:
                result = self.run(**kwargs)
            except Exception as e:
                logger.warning("skill failed key=%s error=%s", self.key, type(e).__name__)
                return f"ERROR: {self.key} is unavailable right now."
            return json.dumps(result, default=str) if isinstance(result, dict) else str(result)

        return StructuredTool.from_function(
            call,
            # provider tool names only allow [a-zA-Z0-9_-]
            name=self.key.replace(".", "_").replace(":", "_"),
            description=self.description,
            args_schema=self.input_schema or {"type": "object", "properties": {}},
        )


def enabled_skills(chat: Chat, session_id: str) -> list[Skill]:
    skills = []
    rows = list(chat.chatskill_set.order_by("id"))
    for row in rows:
        if not row.is_active:
            continue
        cls = SkillRegistry.get(row.key)
        if cls is None or not cls.read_only:
            logger.warning("skill skipped chat=%s key=%s reason=%s", chat.pk, row.key,
                           "unregistered" if cls is None else "not_read_only")
            continue
        try:
            config = cls.config_model.model_validate(row.config) if cls.config_model else None
        except pydantic.ValidationError:
            logger.warning("skill skipped chat=%s key=%s reason=invalid_config", chat.pk, row.key)
            continue
        skills.append(cls(chat=chat, session_id=session_id, config=config))
    enrolled = {row.key for row in rows}
    for cls in SkillRegistry.all().values():
        if cls.default and cls.read_only and cls.key not in enrolled:
            skills.append(cls(chat=chat, session_id=session_id, config=None))
    return skills
