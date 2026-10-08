import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class EvalCase:
    instance_id: str
    database: str
    query: str
    sol_sql: Optional[str]
    expected_insight: Optional[str]
    category: str
    high_level: bool
    amb_user_query: str
    external_knowledge: list
    conditions: dict
    difficulty_tier: str
    knowledge_snippets: list[str] = field(default_factory=list)
    expected_tools: Optional[list[str]] = None
    db_id: str = ""
    user_id: str = ""


def _extract_sql_snippets(entry: dict) -> list[str]:
    snippets = []
    for item in entry.get("knowledge_ambiguity", []):
        if item.get("sql_snippet"):
            snippets.append(item["sql_snippet"])
    ambiguity = entry.get("user_query_ambiguity", {})
    for item in ambiguity.get("critical_ambiguity", []):
        if item.get("sql_snippet"):
            snippets.append(item["sql_snippet"])
    return snippets


def _build_sol_sql(entry: dict) -> str:
    solutions = entry.get("sol_sql")
    if isinstance(solutions, list) and solutions:
        return solutions[0] or ""
    if isinstance(solutions, str):
        return solutions
    return ""


def load_bird_interact(
    path: str,
    domain: Optional[str] = None,
    limit: Optional[int] = None,
) -> list[EvalCase]:
    if limit is not None and limit < 1:
        raise ValueError("limit must be a positive integer or None")

    filepath = Path(path)
    cases = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            entry = json.loads(line)
            if domain and entry.get("selected_database") != domain:
                continue
            case = EvalCase(
                instance_id=entry["instance_id"],
                database=entry["selected_database"],
                query=entry["query"],
                sol_sql=_build_sol_sql(entry) or None,
                expected_insight=(
                    entry.get("expected_insight")
                    or entry.get("expected_answer")
                    or entry.get("answer")
                    or None
                ),
                category=entry.get("category", "Query"),
                high_level=entry.get("high_level", False),
                amb_user_query=entry.get("amb_user_query", ""),
                external_knowledge=entry.get("external_knowledge", []),
                conditions=entry.get("conditions", {}),
                difficulty_tier=entry.get("difficulty_tier", "Simple"),
                knowledge_snippets=_extract_sql_snippets(entry),
                expected_tools=(
                    entry["expected_tools"]
                    if isinstance(entry.get("expected_tools"), list)
                    else None
                ),
            )
            cases.append(case)
            if limit and len(cases) >= limit:
                break
    return cases


def load_alien_schema(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def load_alien_kb(path: str) -> list[dict]:
    items = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                items.append(json.loads(line))
    return items
