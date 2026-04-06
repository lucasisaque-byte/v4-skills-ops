from __future__ import annotations

import json
from pathlib import Path
import sys


def main() -> int:
    # Garante que imports do repo funcionem quando rodado de qualquer CWD
    repo_root = Path(__file__).resolve().parents[2]
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))

    # Import local para evitar custo de import em tooling
    from api.main import app

    out_dir = repo_root / "docs" / "contracts" / "openapi"
    out_dir.mkdir(parents=True, exist_ok=True)

    spec = app.openapi()
    out_path = out_dir / "openapi.json"
    out_path.write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

