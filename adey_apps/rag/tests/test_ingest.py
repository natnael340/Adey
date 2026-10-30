import pytest
from django.core.files.base import ContentFile
from django.core.management import call_command

from adey_apps.rag import db as rag_db
from adey_apps.rag.ingest import index_chat, load_resource, split_documents, split_table
from adey_apps.rag.utils import clean_text


def test_clean_text_keeps_punctuation_and_non_latin():
    text = "Price: $20 — email help@adey.et  \n\n\n\nሰላም   ዓለም"
    assert clean_text(text) == "Price: $20 — email help@adey.et\n\nሰላም ዓለም"


def test_clean_text_keeps_tabs_between_columns():
    assert clean_text("plan\tprice\nBasic\t$10") == "plan\tprice\nBasic\t$10"


def test_load_resource_reads_text_through_storage(db, resource_factory):
    resource = resource_factory(name="FAQ", document_type="TXT",
                                document=ContentFile(b"Shipping takes 3 days.", name="faq.txt"))
    [doc] = load_resource(resource)
    assert doc.page_content == "Shipping takes 3 days."
    assert doc.metadata == {"chat_id": str(resource.chat.identifier), "title": "FAQ",
                            "resource": resource.slug, "type": "TXT", "page": None}


def test_split_documents_prefixes_markdown_section_path(db, resource_factory):
    md = b"# Returns\n## Window\nYou can return items within 30 days."
    resource = resource_factory(name="Policy", document_type="MD", document=ContentFile(md, name="p.md"))
    [chunk] = split_documents(load_resource(resource))
    assert chunk.page_content.startswith("Policy › Returns › Window\n\n")
    assert "30 days" in chunk.page_content
    assert chunk.metadata["chunk_id"] == f"{resource.chat.identifier}:{resource.slug}:0"


def test_split_documents_turns_html_into_markdown_sections_and_tables(db, resource_factory):
    html = (b"<html><head><style>p{color:red}</style><script>track()</script></head><body>"
            b"<h1>Pricing</h1><h2>Plans</h2><p>Billed monthly.</p>"
            b"<table><tr><th>Plan</th><th>Price</th></tr><tr><td>Gold</td><td>450</td></tr></table></body></html>")
    resource = resource_factory(name="Site", document_type="HTML", document=ContentFile(html, name="s.html"))
    chunks = [c.page_content for c in split_documents(load_resource(resource))]
    assert all(c.startswith("Site › Pricing › Plans\n\n") for c in chunks)
    assert any("Billed monthly." in c for c in chunks)
    assert any("| Plan | Price |\n| --- | --- |\n| Gold | 450 |" in c for c in chunks)
    assert not any("track()" in c or "color:red" in c for c in chunks)


def test_load_resource_pretty_prints_json(db, resource_factory):
    resource = resource_factory(name="Hours", document_type="JSON",
                                document=ContentFile('{"open":"9:00","days":["ሰኞ"]}'.encode(), name="h.json"))
    [doc] = load_resource(resource)
    assert doc.page_content == '{\n  "open": "9:00",\n  "days": [\n    "ሰኞ"\n  ]\n}'


def test_split_table_repeats_header_and_never_cuts_a_row():
    rows = [f"Plan {i},${i}0,{i} bots" for i in range(60)] + ["X" * 1200]
    chunks = split_table("plan,price,limit", rows, chunk_size=200)
    assert len(chunks) > 2
    assert all(c.startswith("plan,price,limit\n") and len(c) <= 200 for c in chunks[:-1])
    assert chunks[-1] == "plan,price,limit\n" + "X" * 1200
    body_rows = [r for c in chunks for r in c.split("\n")[1:]]
    assert body_rows == rows                      # every row once, in order, uncut


def test_split_documents_repeats_csv_header_in_every_chunk(db, resource_factory):
    csv_bytes = ("plan,price,note\n" + "".join(f'Plan {i},${i}0,"fits, {i} bots"\n' for i in range(80))).encode()
    resource = resource_factory(name="Pricing", document_type="CSV", document=ContentFile(csv_bytes, name="p.csv"))
    chunks = split_documents(load_resource(resource))
    assert len(chunks) > 1
    for chunk in chunks:
        assert chunk.page_content.startswith("Pricing\n\nplan,price,note\n")
    assert '"fits, 79 bots"' in chunks[-1].page_content


def test_split_documents_keeps_markdown_table_header_and_prose_apart(db, resource_factory):
    table = "| Plan | Price |\n| --- | --- |\n" + "".join(f"| Plan {i} | ${i}0 |\n" for i in range(80))
    md = f"# Pricing\nOur plans are billed monthly.\n\n{table}\nPrices include VAT.".encode()
    resource = resource_factory(name="Site", document_type="MD", document=ContentFile(md, name="s.md"))
    chunks = [c.page_content for c in split_documents(load_resource(resource))]
    table_chunks = [c for c in chunks if "| Plan 1 |" in c or "| Plan 79 |" in c]
    assert len(table_chunks) > 1
    assert all("| Plan | Price |\n| --- | --- |\n" in c for c in table_chunks)
    assert not any("billed monthly" in c for c in table_chunks)
    assert any("billed monthly" in c for c in chunks) and any("include VAT" in c for c in chunks)


def test_index_chat_is_idempotent_and_drops_removed_resources(pg_vector_db, fake_rag_embeddings, chat, resource_factory):
    keep = resource_factory(chat=chat, document_type="TXT", document=ContentFile(b"keep me", name="a.txt"))
    gone = resource_factory(chat=chat, document_type="TXT", document=ContentFile(b"remove me", name="b.txt"))
    assert index_chat(chat) == 2
    assert index_chat(chat) == 2          # rebuild does not duplicate
    gone.delete()
    assert index_chat(chat) == 1
    docs = rag_db.get_chunk_store().similarity_search("x", k=10, filter={"chat_id": str(chat.identifier)})
    assert [d.metadata["resource"] for d in docs] == [keep.slug]


def test_index_chat_also_refreshes_the_legacy_agent_index(pg_vector_db, fake_rag_embeddings, chat, resource_factory):
    resource = resource_factory(chat=chat, document_type="TXT",
                                document=ContentFile(b"Refunds are issued as store credit.", name="a.txt"))
    index_chat(chat)
    index_chat(chat)                      # rebuild replaces, does not duplicate
    docs = rag_db.get_vectorstore(chat.identifier).similarity_search("refund", k=10)
    assert [d.page_content for d in docs] == [f"{resource.name}\n\nRefunds are issued as store credit."]
    resource.delete()
    index_chat(chat)
    assert rag_db.get_vectorstore(chat.identifier).similarity_search("refund", k=10) == []


def test_index_chat_leaves_index_untouched_when_a_resource_fails(db, mocker, chat, resource_factory):
    resource_factory(chat=chat)
    mocker.patch("adey_apps.rag.ingest.load_resource", side_effect=OSError("s3 down"))
    delete = mocker.patch("adey_apps.rag.ingest.delete_chat_chunks")
    with pytest.raises(OSError):
        index_chat(chat)
    delete.assert_not_called()


def test_reindex_chats_reports_failures_and_continues(db, mocker, capsys, chat_factory, resource_factory):
    bad, good = chat_factory(), chat_factory()
    resource_factory(chat=bad)
    resource_factory(chat=good)

    def fake_index(c):
        if c == bad:
            raise OSError("boom")
        return 3

    mocker.patch("adey_apps.rag.management.commands.reindex_chats.index_chat", side_effect=fake_index)
    with pytest.raises(SystemExit) as exc:
        call_command("reindex_chats")
    assert exc.value.code != 0
    out = capsys.readouterr().out
    assert f"{bad.slug}: FAILED boom" in out
    assert f"{good.slug}: 3 chunks" in out


def test_split_documents_splits_back_to_back_markdown_tables(db, resource_factory):
    md = b"# A\n| a | b |\n|---|---|\n| 1 | 2 |\n\n| c | d |\n|---|---|\n| 3 | 4 |"
    resource = resource_factory(name="T", document_type="MD", document=ContentFile(md, name="t.md"))
    chunks = [c.page_content for c in split_documents(load_resource(resource))]
    assert len(chunks) == 2
    first, second = chunks
    assert "| a | b |" in first and "| 1 | 2 |" in first and "| c | d |" not in first
    assert "\n\n| c | d |\n|---|---|\n" in second and "| 3 | 4 |" in second


def test_index_chat_keeps_old_index_when_embedding_fails(pg_vector_db, fake_rag_embeddings, mocker, chat, resource_factory):
    resource_factory(chat=chat, document_type="TXT", document=ContentFile(b"keep me", name="a.txt"))
    index_chat(chat)
    mocker.patch.object(rag_db.get_chunk_store(), "add_documents", side_effect=RuntimeError("openai down"))
    with pytest.raises(RuntimeError):
        index_chat(chat)
    docs = rag_db.get_chunk_store().similarity_search("x", k=10, filter={"chat_id": str(chat.identifier)})
    assert len(docs) == 1


def test_clean_text_normalizes_line_endings():
    assert clean_text("a  \r\nb\r\n\r\n\r\n\r\nc") == "a\nb\n\nc"
    assert clean_text("a\rb") == "a\nb"
