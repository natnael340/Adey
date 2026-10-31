from datetime import datetime, timezone as dt_timezone

import pytest
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.db import connection

from adey_apps.rag.skills.base import Skill, SkillRegistry, enabled_skills
from adey_apps.rag.skills.clock import ClockNow
from adey_apps.rag.models import ChatSkill
from adey_apps.rag.tests.skills import Boom


@pytest.fixture
def isolated_registry(monkeypatch):
    monkeypatch.setattr(SkillRegistry, "_classes", dict(SkillRegistry._classes))


def test_subclass_registers_and_duplicate_key_raises(isolated_registry):
    class First(Skill):
        key = "test.dup"

        def run(self):
            return "first"

    assert SkillRegistry.get("test.dup") is First
    assert SkillRegistry.all()["clock.now"] is ClockNow
    with pytest.raises(ImproperlyConfigured):
        class Second(Skill):
            key = "test.dup"

            def run(self):
                return "second"


def test_knowledge_key_is_reserved(isolated_registry):
    with pytest.raises(ImproperlyConfigured):
        class Knowledge(Skill):
            key = "knowledge"

            def run(self):
                return ""


def test_tool_name_mangles_dots(db, chat):
    assert ClockNow(chat=chat, session_id="s", config=None).as_langchain_tool().name == "clock_now"


def test_tool_error_becomes_error_string(db, chat):
    tool = Boom(chat=chat, session_id="s", config=None).as_langchain_tool()
    result = tool.invoke({})
    assert result.startswith("ERROR:")
    assert "sk-secret" not in result


def test_config_is_encrypted_at_rest(db, chat):
    row = ChatSkill.objects.create(chat=chat, key="test.echo_key", config={"api_key": "sk-secret-1234"})
    with connection.cursor() as cursor:
        cursor.execute("SELECT config FROM rag_chatskill WHERE id = %s", [row.id])
        raw = cursor.fetchone()[0]
    assert "sk-secret" not in raw
    assert ChatSkill.objects.get(id=row.id).config == {"api_key": "sk-secret-1234"}


def test_clean_rejects_unknown_key_and_bad_config(db, chat):
    with pytest.raises(ValidationError):
        ChatSkill(chat=chat, key="nope.x").clean()
    with pytest.raises(ValidationError):
        ChatSkill(chat=chat, key="test.echo_key", config={}).clean()
    ChatSkill(chat=chat, key="test.echo_key", config={"api_key": "sk-1"}).clean()


def test_each_bot_uses_its_own_config(db, chat_factory):
    a, b = chat_factory(), chat_factory()
    ChatSkill.objects.create(chat=a, key="test.echo_key", config={"api_key": "sk-a-AAAA"})
    ChatSkill.objects.create(chat=b, key="test.echo_key", config={"api_key": "sk-b-BBBB"})
    assert enabled_skills(a, "s")[0].run() == "AAAA"
    assert enabled_skills(b, "s")[0].run() == "BBBB"
    assert enabled_skills(a, "s")[0] is not enabled_skills(a, "s")[0]


def test_enabled_skills_skips_bad_rows(db, chat):
    ChatSkill.objects.bulk_create([
        ChatSkill(chat=chat, key="clock.now"),
        ChatSkill(chat=chat, key="test.boom", is_active=False),
        ChatSkill(chat=chat, key="removed.tool"),
        ChatSkill(chat=chat, key="test.write"),
        ChatSkill(chat=chat, key="test.echo_key", config={}),
    ])
    caps = enabled_skills(chat, "s")
    assert [type(c) for c in caps] == [ClockNow]
    assert caps[0].chat == chat and caps[0].session_id == "s"


def test_clock_now_returns_local_time(db, chat, settings, mocker):
    settings.TIME_ZONE = "Europe/Warsaw"
    mocker.patch("django.utils.timezone.now", return_value=datetime(2026, 10, 31, 13, 5, tzinfo=dt_timezone.utc))
    assert ClockNow(chat=chat, session_id="s", config=None).run() == "Saturday 31 October 2026, 14:05 (Europe/Warsaw)"
