"""
Carrega o contexto completo de um cliente a partir de clients/{id}/
"""
import json
from pathlib import Path

CLIENTS_DIR = Path(__file__).parent.parent.parent / "clients"


def _read_text(path: Path) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return None


def _read_json(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def list_clients() -> list[dict]:
    """Lista todos os clientes disponíveis em clients/"""
    clients = []
    for entry in sorted(CLIENTS_DIR.iterdir()):
        if not entry.is_dir() or entry.name.startswith("_"):
            continue
        client_id = entry.name
        brand_dir = entry / "brand"
        # Lê a cor primária do design-tokens se existir
        primary_color = None
        tokens = _read_json(brand_dir / "design-tokens.json")
        if tokens:
            primary_color = (
                tokens.get("color", {}).get("primary", {}).get("500")
                or tokens.get("color", {}).get("primary", {}).get("DEFAULT")
                or tokens.get("color", {}).get("primary")
            )
            if isinstance(primary_color, dict):
                primary_color = list(primary_color.values())[0] if primary_color else None

        # Tenta ler o segmento do brand-raw
        brand_raw = _read_json(brand_dir / "brand-raw.json")
        segment = ""
        if brand_raw:
            segment = (
                brand_raw.get("segmento")
                or brand_raw.get("metadata", {}).get("segmento", "")
                or brand_raw.get("meta", {}).get("segmento", "")
                or ""
            )

        clients.append({
            "id": client_id,
            "name": _display_name(client_id),
            "segment": segment,
            "has_dcc": (entry / "dcc.md").exists() or bool(list(entry.glob("*/dcc.md"))),
            "has_ucm": (entry / "ucm.md").exists() or bool(list(entry.glob("*/ucm.md"))),
            "has_brand_system": (brand_dir / "identidade-visual.md").exists(),
            "primary_color": primary_color,
        })
    return clients


def get_client(client_id: str) -> dict | None:
    """Retorna dados completos do cliente incluindo conteúdo dos documentos"""
    client_dir = CLIENTS_DIR / client_id
    if not client_dir.exists():
        return None

    brand_dir = client_dir / "brand"

    # Busca dcc.md e ucm.md em qualquer nível da pasta do cliente
    dcc_path = _find_file(client_dir, "dcc.md")
    ucm_path = _find_file(client_dir, "ucm.md")

    brand_raw = _read_json(brand_dir / "brand-raw.json")
    tokens = _read_json(brand_dir / "design-tokens.json")

    primary_color = None
    segment = ""
    if tokens:
        primary_color = (
            tokens.get("color", {}).get("primary", {}).get("500")
            or tokens.get("color", {}).get("primary", {}).get("DEFAULT")
            or tokens.get("color", {}).get("primary")
        )
        if isinstance(primary_color, dict):
            primary_color = list(primary_color.values())[0] if primary_color else None
    if brand_raw:
        segment = (
            brand_raw.get("segmento")
            or brand_raw.get("metadata", {}).get("segmento", "")
            or brand_raw.get("meta", {}).get("segmento", "")
            or ""
        )

    return {
        "id": client_id,
        "name": _display_name(client_id),
        "segment": segment,
        "has_dcc": dcc_path is not None,
        "has_ucm": ucm_path is not None,
        "has_brand_system": (brand_dir / "identidade-visual.md").exists(),
        "primary_color": primary_color,
        "brand": {
            "tokens": tokens,
            "has_identidade": (brand_dir / "identidade-visual.md").exists(),
            "has_design_system": (brand_dir / "design-system-social-media.md").exists(),
        },
        "dcc_size": dcc_path.stat().st_size if dcc_path else 0,
        "ucm_size": ucm_path.stat().st_size if ucm_path else 0,
    }


def get_client_context(client_id: str) -> dict | None:
    """Retorna contexto completo com conteúdo dos documentos para injeção nos skills"""
    client_dir = CLIENTS_DIR / client_id
    if not client_dir.exists():
        return None

    brand_dir = client_dir / "brand"
    dcc_path = _find_file(client_dir, "dcc.md")
    ucm_path = _find_file(client_dir, "ucm.md")

    return {
        "client_id": client_id,
        "client_name": _display_name(client_id),
        "dcc": _read_text(dcc_path) if dcc_path else None,
        "ucm": _read_text(ucm_path) if ucm_path else None,
        "brand": {
            "identidade": _read_text(brand_dir / "identidade-visual.md"),
            "design_system": _read_text(brand_dir / "design-system-social-media.md"),
            "tokens": _read_json(brand_dir / "design-tokens.json"),
            "brand_raw": _read_json(brand_dir / "brand-raw.json"),
        },
    }


def _find_file(base: Path, filename: str) -> Path | None:
    """Encontra um arquivo pelo nome exato ou por padrão glob em qualquer nível"""
    # Busca exata primeiro
    matches = list(base.rglob(filename))
    if matches:
        return matches[0]
    # Busca flexível: *dcc* ou *ucm* para tolerar variações de nome
    stem = filename.replace(".md", "").replace(".json", "")
    matches = [p for p in base.rglob(f"*{stem}*") if p.is_file()]
    return matches[0] if matches else None


def _display_name(client_id: str) -> str:
    """Converte id de pasta para nome de exibição"""
    mapping = {
        "kce": "KCE Logística",
        "via-journey": "Via Journey",
        "alan": "Alan",
        "eduzz": "Eduzz",
        "hs-prevent": "HS Prevent",
    }
    return mapping.get(client_id, client_id.replace("-", " ").title())
