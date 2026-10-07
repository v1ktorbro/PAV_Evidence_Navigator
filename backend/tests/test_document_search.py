from backend.app.domain.document_search import chunk_page_text, rank_chunks, tokenise


def test_tokenise_supports_cyrillic_latin_and_numbers():
    assert tokenise("ПАВ при pH 7.4 и 75 °C") == ["пав", "при", "ph", "7", "4", "и", "75", "c"]


def test_chunks_keep_a_single_source_page_and_stable_identifiers():
    text = "слово " * 80

    chunks = chunk_page_text(
        document_id="DOC-1",
        page=7,
        text=text,
        chunk_chars=120,
        overlap_chars=20,
    )

    assert len(chunks) > 1
    assert [chunk["id"] for chunk in chunks] == [
        f"DOC-1:p7:c{index}" for index in range(1, len(chunks) + 1)
    ]
    assert {chunk["page"] for chunk in chunks} == {7}
    assert all(len(chunk["text"]) <= 120 for chunk in chunks)


def test_lexical_ranking_prefers_full_term_coverage_and_is_deterministic():
    chunks = [
        {
            "id": "DOC-A:p1:c1",
            "document_id": "DOC-A",
            "document_name": "A.pdf",
            "page": 1,
            "ordinal": 1,
            "text": "ПАВ уменьшил межфазное натяжение.",
        },
        {
            "id": "DOC-B:p2:c1",
            "document_id": "DOC-B",
            "document_name": "B.pdf",
            "page": 2,
            "ordinal": 1,
            "text": "ПАВ уменьшил межфазное натяжение при температуре 75 C.",
        },
        {
            "id": "DOC-C:p1:c1",
            "document_id": "DOC-C",
            "document_name": "C.pdf",
            "page": 1,
            "ordinal": 1,
            "text": "Температура опыта была 75 C.",
        },
    ]

    first = rank_chunks("ПАВ температура", chunks, limit=10)
    second = rank_chunks("ПАВ температура", list(reversed(chunks)), limit=10)

    assert [item["id"] for item in first] == [
        "DOC-B:p2:c1",
        "DOC-A:p1:c1",
        "DOC-C:p1:c1",
    ]
    assert [item["id"] for item in second] == [item["id"] for item in first]
    assert first[0]["excerpt"].startswith("ПАВ")
