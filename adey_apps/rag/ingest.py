"""
Turn a chat's uploaded resources into chunks in the shared ``rag_chunks`` table.

Every chunk starts with a header line (document title and markdown section path) so the
text stays meaningful on its own. Tables are packed row by row under a repeated header.
"""
import csv
import io
import re
from collections import defaultdict

from langchain_core.documents import Document
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from pypdf import PdfReader

from adey_apps.rag.db import delete_chat_chunks, get_chunk_store
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
    text = clean_text(data.decode("utf-8", errors="replace"))
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


def _split_markdown_tables(text: str) -> list[tuple[str, list[str]]]:
    """Returns (header, rows) pairs; header is "" for prose, which then has one "row": the text."""
    lines = text.split("\n")
    parts, prose, i = [], [], 0
    while i < len(lines):
        if lines[i].startswith("|") and i + 1 < len(lines) and _SEPARATOR_LINE.match(lines[i + 1]):
            if prose:
                parts.append(("", ["\n".join(prose)]))
                prose = []
            header, i, rows = "\n".join(lines[i:i + 2]), i + 2, []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append(lines[i])
                i += 1
            parts.append((header, rows))
        else:
            prose.append(lines[i])
            i += 1
    if prose:
        parts.append(("", ["\n".join(prose)]))
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
        # (section path, text) sections, each later split into tables and prose
        if meta["type"] == Resource.DocumentTypeChoices.MD:
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
                for header, rows in _split_markdown_tables(text):
                    if header:
                        bodies += split_table(header, rows)
                    else:
                        bodies += [b for b in prose_splitter.split_text(rows[0]) if b.strip()]
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
    # Load and split everything first so a failing download leaves the old index intact.
    docs = []
    for resource in chat.resource_set.all():
        docs.extend(load_resource(resource))
    chunks = split_documents(docs)
    # shortcut: delete-then-add leaves a brief empty index, wrap both in one transaction if bots get rebuilt while busy
    delete_chat_chunks(str(chat.identifier))
    if chunks:
        get_chunk_store().add_documents(chunks, ids=[c.metadata["chunk_id"] for c in chunks])
    return len(chunks)
