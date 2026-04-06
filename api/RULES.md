# Rules — `api/` (FastAPI, contratos e persistência)

Escopo: delivery HTTP (BC4) e partes de BC1/BC2/BC6.

## Contrato (OpenAPI)

- A API expõe OpenAPI em `/openapi.json` (gerado pelo FastAPI).
- A UI do Swagger é servida em `/docs` via HTML custom (`api/main.py`).
- Mudanças de payload devem ser acompanhadas por:
  - exemplos no OpenAPI (quando aplicável via modelos/response_model)
  - notas em `docs/templates/contracts/openapi-contract-notes.md` (instanciado por domínio quando crescer)

## Modelos e “schema”

- Modelos de dados (Pydantic) vivem em `api/models/`.
- Quando não existir DB relacional, o “schema” operacional pode ser:
  - JSON persistido em disco (`outputs/<client_id>/entries.json`)
  - runtime data em `data/` (não versionado)

## Persistência (BC6)

- `outputs/` é store legado de entregáveis (filesystem JSON).
- Evitar breaking changes no formato sem um plano de migração e compatibilidade:
  - versão de schema (campo `schema_version`), ou
  - reader tolerante (fallbacks) + writer novo.

## Padrões de endpoints

- Listagens devem limitar payload (ex.: remover `content` completo em listagem).
- Sempre oferecer limite/ordenação explícitos quando o volume crescer.
- Erros: usar `HTTPException` com mensagens úteis (sem vazar dados sensíveis).

