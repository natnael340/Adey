import csv
import io
import json
import re
from collections import defaultdict

from langchain_core.documents import Document
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from markdownify import markdownify
from pypdf import PdfReader

from adey_apps.rag.db import (
    delete_chat_chunks, delete_stale_chat_chunks, delete_vector_collection, get_chunk_store, replace_vector_collection,
)
from adey_apps.rag.models import Chat, Resource
from adey_apps.rag.utils import clean_text

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150

_SEPARATOR_LINE = re.compile(r"^\|[\s:|-]*-[\s:|-]*$")
_MD_HEADERS = [("#", "h1"), ("##", "h2"), ("###", "h3")]


def load_resource(resource: Resource) -> list[Document]:
    metadata = {
        "chat_id": str(resource.chat.identifier),
        "title": resource.name,
        "resource": resource.slug,
        "type": resource.document_type,
    }
    with resource.document.open("rb") as file:
        data = file.read()
    if resource.document_type == Resource.DocumentTypeChoices.PDF:
        # shortcut: PDF tables are chunked as prose, use a layout-aware PDF parser if customers upload table-heavy PDFs
        pages = (page.extract_text() or "" for page in PdfReader(io.BytesIO(data)).pages)
        return [
            Document(page_content=text, metadata={**metadata, "page": number})
            for number, text in enumerate(pages, start=1)
            if text.strip()
        ]
    text = data.decode("utf-8", errors="replace")
    if resource.document_type == Resource.DocumentTypeChoices.JSON:
        text = json.dumps(json.loads(text), indent=2, ensure_ascii=False)
    elif resource.document_type == Resource.DocumentTypeChoices.HTML:
        text = clean_text(markdownify(text, heading_style="ATX"))
    else:
        text = clean_text(text)
    return [Document(page_content=text, metadata={**metadata, "page": None})]


def split_table(header: str, rows: list[str], chunk_size: int = CHUNK_SIZE) -> list[str]:
    chunks, current = [], []
    for row in rows:
        if current and len("\n".join([header, *current, row])) > chunk_size:
            chunks.append("\n".join([header, *current]))
            current = []
        current.append(row)
    if current:
        chunks.append("\n".join([header, *current]))
    return chunks


def _starts_table(lines: list[str], i: int) -> bool:
    return lines[i].startswith("|") and i + 1 < len(lines) and bool(_SEPARATOR_LINE.match(lines[i + 1]))


def _split_markdown_tables(text: str) -> list[str | tuple[str, list[str]]]:
    lines = text.split("\n")
    parts, prose, i = [], [], 0
    while i < len(lines):
        if _starts_table(lines, i):
            if prose:
                parts.append("\n".join(prose))
                prose = []
            header, i, rows = "\n".join(lines[i:i + 2]), i + 2, []
            while i < len(lines) and lines[i].startswith("|") and not _starts_table(lines, i):
                rows.append(lines[i])
                i += 1
            parts.append((header, rows))
        else:
            prose.append(lines[i])
            i += 1
    if prose:
        parts.append("\n".join(prose))
    return parts


def _csv_table(text: str) -> tuple[str, list[str]]:
    records = []
    for record in csv.reader(io.StringIO(text, newline="")):
        out = io.StringIO()
        csv.writer(out, lineterminator="").writerow(record)
        records.append(out.getvalue())
    return (records[0], records[1:]) if records else ("", [])


def split_documents(docs: list[Document]) -> list[Document]:
    prose_splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    markdown_splitter = MarkdownHeaderTextSplitter(_MD_HEADERS)
    counters = defaultdict(int)
    chunks = []

    for doc in docs:
        meta = doc.metadata
        sections: list[tuple[list[str], str]]
        if meta["type"] in (Resource.DocumentTypeChoices.MD, Resource.DocumentTypeChoices.HTML):
            sections = [
                (
                    [s.metadata[key] for _, key in _MD_HEADERS if key in s.metadata],
                    clean_text(s.page_content),
                )
                for s in markdown_splitter.split_text(doc.page_content)
            ]
        else:
            sections = [([], doc.page_content)]

        for path, text in sections:
            title = " › ".join([meta["title"], *path])
            if meta["type"] == Resource.DocumentTypeChoices.CSV:
                header, rows = _csv_table(text)
                bodies = split_table(header, rows) if header else []
            else:
                bodies = []
                for part in _split_markdown_tables(text):
                    if isinstance(part, str):
                        bodies += [b for b in prose_splitter.split_text(part) if b.strip()]
                    else:
                        bodies += split_table(*part)
            for body in bodies:
                key = (meta["chat_id"], meta["resource"])
                chunk_id = f"{meta['chat_id']}:{meta['resource']}:{counters[key]}"
                counters[key] += 1
                chunks.append(Document(
                    page_content=f"{title}\n\n{body}",
                    metadata={**meta, "chunk_id": chunk_id},
                ))
    return chunks


def index_chat(chat: Chat) -> int:
    docs = []
    for resource in chat.resource_set.all():
        docs.extend(load_resource(resource))
    chunks = split_documents(docs)
    chat_id = str(chat.identifier)
    if not chunks:
        delete_chat_chunks(chat_id)
        delete_vector_collection(chat_id)
        return 0
    ids = [c.metadata["chunk_id"] for c in chunks]
    get_chunk_store().add_documents(chunks, ids=ids)
    delete_stale_chat_chunks(chat_id, ids)
    # shortcut: keeps LegacyAgentPass answering while AGENT_DEFAULT_PASS=agent, delete with LegacyAgentPass (rollout step 6)
    replace_vector_collection(chat_id, chunks)
    return len(chunks)
