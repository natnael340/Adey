import re

from django.conf import settings

import openai
from urllib.parse import urlparse, parse_qsl, unquote_plus

openai.api_key = settings.OPENAI_API_KEY


class Url(object):
    def __init__(self, url) -> None:
        parts = urlparse(url)
        _query = frozenset(parse_qsl(parts.query))
        _path = unquote_plus(parts.path)
        parts = parts._replace(query=_query, path=_path)
        self.parts = parts
    def __eq__(self, other):
        return self.parts == other.parts
    def __hash__(self):
        return hash(self.parts)


def key_value_to_dict(value) -> dict:
    return dict(
        item.strip().split("=") for item in value.split(";")
    )


def clean_text(text: str) -> str:
    """Whitespace-only cleanup. Tabs stay: they separate columns in tab-separated tables."""
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r" +$", "", text, flags=re.MULTILINE)
    return re.sub(r"\n{3,}", "\n\n", text)
