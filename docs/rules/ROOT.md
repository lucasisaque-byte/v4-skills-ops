# Rules — Raiz do repositório (escopo global)

Estas regras são o “nível 1” do padrão de **Progressive Disclosure**: convenções globais e como navegar o monorepo.

## Estrutura (bounded contexts)

Referência: `docs/adr/0001-repository-structure.md`.

- `api/`: camada de entrega HTTP + parte do domínio (BC1/BC2/BC4)
- `platform/`: entrega web (BC4)
- `skills/`: base de conhecimento das skills (BC3)
- `clients/`: contexto por cliente (BC5)
- `outputs/`: artifact store legado (BC6 transitório)
- `data/`: runtime data (BC6 permanente) — **não comitar** (ver `.gitignore`)
- `docs/`: conhecimento e documentação (BC7)
- `tooling/`: scripts e automações

## Processo obrigatório (RPI)

Ao produzir/atualizar documentação e contratos, seguir:

### Research

- Identificar fontes de verdade:
  - Modelos (Pydantic) em `api/models/`
  - Persistência atual (filesystem JSON) em `outputs/` e `api/services/*store*`
  - Contratos HTTP via OpenAPI (FastAPI): `/openapi.json`
- Listar lacunas: ausência de DB/ORM/migrations, endpoints sem schema de resposta, etc.

### Plan

- Organizar por domínio/bounded context (ex.: BC6 Artifact Store).
- Entregar artefatos mínimos por domínio:
  - Overview
  - Data Dictionary (mesmo que “schema” seja JSON)
  - Relationship map (mesmo que seja referência por id)
  - Contract notes (OpenAPI / payloads)
  - Change management (rollout, compatibilidade)

### Implement

- Atualizar docs + contratos + código de forma atômica.
- Sempre incluir exemplos mínimos (redigidos, sem PII real).

## Convenções de documentação

- Preferir arquivos pequenos, por domínio (evitar “mega arquivo”).
- Sempre registrar decisões em ADR quando for:
  - mudar contrato de API
  - introduzir DB/ORM/migrations
  - alterar persistência (ex.: `outputs/` → Supabase)

