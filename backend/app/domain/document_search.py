from __future__ import annotations

import re
from collections import Counter
from collections.abc import Iterable
from typing import Any


_TOKEN_PATTERN = re.compile(r"[^\W_]+", re.UNICODE)
_WHITESPACE_PATTERN = re.compile(r"\s+")


def normalise_text(value: str) -> str:
    """Make extracted PDF text stable enough for display and local search."""
    return _WHITESPACE_PATTERN.sub(" ", value).strip()


def tokenise(value: str) -> list[str]:
    """Return case-insensitive Unicode word tokens, including Cyrillic terms."""
    return [match.group(0).casefold() for match in _TOKEN_PATTERN.finditer(value)]


def chunk_page_text(
    *,
    document_id: str,
    page: int,
    text: str,
    chunk_chars: int,
    overlap_chars: int,
) -> list[dict[str, Any]]:
    """Chunk one page only, so every result always has an exact page citation."""
    if chunk_chars < 100:
        raise ValueError("Размер фрагмента должен быть не меньше 100 символов.")
    if overlap_chars < 0 or overlap_chars >= chunk_chars:
        raise ValueError("Перекрытие фрагментов должно быть меньше размера фрагмента.")

    value = normalise_text(text)
    if not value:
        return []

    chunks: list[dict[str, Any]] = []
    start = 0
    ordinal = 1
    while start < len(value):
        end = min(start + chunk_chars, len(value))
        if end < len(value):
            split_at = value.rfind(" ", start + chunk_chars // 2, end)
            if split_at > start:
                end = split_at

        fragment = value[start:end].strip()
        if fragment:
            chunks.append(
                {
                    "id": f"{document_id}:p{page}:c{ordinal}",
                    "document_id": document_id,
                    "page": page,
                    "ordinal": ordinal,
                    "text": fragment,
                }
            )
            ordinal += 1

        if end >= len(value):
            break
        next_start = end - overlap_chars
        start = next_start if next_start > start else end

    return chunks


def make_excerpt(text: str, query_tokens: Iterable[str], *, max_chars: int = 500) -> str:
    """Return a bounded source excerpt around the first matching term."""
    value = normalise_text(text)
    if len(value) <= max_chars:
        return value

    lowered = value.casefold()
    positions = [lowered.find(token.casefold()) for token in query_tokens]
    match_positions = [position for position in positions if position >= 0]
    focus = min(match_positions) if match_positions else 0
    start = max(0, focus - max_chars // 3)
    end = min(len(value), start + max_chars)
    if end - start < max_chars:
        start = max(0, end - max_chars)

    excerpt = value[start:end].strip()
    if start:
        excerpt = f"…{excerpt}"
    if end < len(value):
        excerpt = f"{excerpt}…"
    return excerpt


def _tokens_match(query_token: str, document_token: str) -> bool:
    """Allow a small, transparent inflection tolerance for long words."""
    if query_token == document_token:
        return True
    if min(len(query_token), len(document_token)) < 5:
        return False

    shared_prefix_length = 0
    for query_character, document_character in zip(query_token, document_token):
        if query_character != document_character:
            break
        shared_prefix_length += 1

    return shared_prefix_length >= min(len(query_token), len(document_token)) - 2


def rank_chunks(
    query: str,
    chunks: Iterable[dict[str, Any]],
    *,
    limit: int,
) -> list[dict[str, Any]]:
    """Rank chunks locally with deterministic lexical relevance.

    This intentionally has no semantic model or remote dependency: it is a
    transparent first retrieval step before a specialist evaluates evidence.
    """
    query_tokens = list(dict.fromkeys(tokenise(query)))
    if not query_tokens:
        return []

    normalised_query = normalise_text(query).casefold()
    scored: list[dict[str, Any]] = []
    for chunk in chunks:
        text = str(chunk.get("text", ""))
        token_counts = Counter(tokenise(text))
        matched_tokens = {
            query_token: [
                document_token
                for document_token in token_counts
                if _tokens_match(query_token, document_token)
            ]
            for query_token in query_tokens
        }
        matched_tokens = {
            query_token: document_tokens
            for query_token, document_tokens in matched_tokens.items()
            if document_tokens
        }
        if not matched_tokens:
            continue

        coverage = len(matched_tokens) / len(query_tokens)
        occurrences = sum(
            min(sum(token_counts[token] for token in tokens), 3)
            for tokens in matched_tokens.values()
        )
        exact_phrase_bonus = 20.0 if normalised_query and normalised_query in text.casefold() else 0.0
        score = round(coverage * 100 + occurrences + exact_phrase_bonus, 3)
        scored.append(
            {
                **chunk,
                "score": score,
                "excerpt": make_excerpt(text, query_tokens),
            }
        )

    scored.sort(
        key=lambda item: (
            -float(item["score"]),
            str(item.get("document_name", "")).casefold(),
            int(item.get("page", 0)),
            int(item.get("ordinal", 0)),
            str(item.get("id", "")),
        )
    )
    return scored[:limit]
