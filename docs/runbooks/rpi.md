# Runbook — RPI (Research → Plan → Implement)

Este runbook padroniza como evoluir **dados/contratos** com rastreabilidade e baixo risco.

## Research

- **Mapear fontes de verdade** (por domínio):
  - “Schema” (DB/ORM/migrations) **ou** modelos (Pydantic) e formatos JSON persistidos
  - Endpoints (routers) e contratos OpenAPI
  - Consumidores (UI/platform) e artefatos gerados (outputs)
- **Listar entidades**:
  - se houver DB: tabelas
  - se não houver: recursos (ex.: `outputs.entries`, `workflow_runs`, `clients.context`)
- **Lacunas**:
  - endpoints sem `response_model`
  - formatos persistidos sem versionamento
  - inconsistências de naming/campos

## Plan

- Organizar por domínio (BCs).
- Para cada domínio, planejar entregas mínimas:
  - Overview + Data Dictionary + Relationship Map
  - Contract notes (OpenAPI)
  - Change management (compatibilidade e rollout)

## Implement

- Executar por domínio, mantendo mudanças atômicas:
  - “schema” → API → client (se existir) → UI
- Sempre incluir exemplos mínimos (redigidos).
- Registrar decisões arquiteturais como ADR quando necessário.

