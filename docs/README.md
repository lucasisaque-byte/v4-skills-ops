# Docs (BC7) — Progressive Disclosure

Este diretório implementa o padrão de **documentação distribuída por escopo** descrito em `clients/metodology context.md`.

## Princípios

- **Fonte da verdade humana**: ADRs/RFCs/Runbooks são a referência principal.
- **Progressive Disclosure**: regras por escopo para reduzir contexto.
- **Contratos fortes**: OpenAPI (API), modelos (Pydantic) e “schemas” (quando existirem) devem se manter consistentes.
- **Mudanças atômicas**: quando mudar dados/contratos, atualizar DB ↔ API ↔ Client ↔ UI na mesma PR.
- **Padrões > nomes de arquivo**: este conjunto de docs descreve “como encontrar” e “como fazer”.

## Onde ficam as “rules”

- **Raiz (stack + convenções globais)**: `docs/rules/ROOT.md`
- **Por pacote/bounded context**:
  - API: `api/RULES.md`
  - Platform (web): `platform/RULES.md`
  - Skills KB: `skills/RULES.md`
  - Client Context: `clients/RULES.md`
  - Artifact Store: `outputs/RULES.md` (legado) e `data/RULES.md` (runtime; não comitar dados)

## Templates obrigatórios (documentação de dados e contratos)

Use os templates em `docs/templates/`:

- **DB Overview / Data Dictionary / Relationship Map / Index Catalog**: `docs/templates/database/`
- **OpenAPI Contract Notes**: `docs/templates/contracts/openapi-contract-notes.md`
- **Client Generation Contract**: `docs/templates/contracts/client-generation-contract.md`
- **Frontend Data Usage Map**: `docs/templates/frontend/frontend-data-usage-map.md`
- **Change Management (migração / rollout)**: `docs/templates/ops/change-management.md`

## Runbooks

- Como exportar contrato OpenAPI (para geração de client e auditoria): `docs/runbooks/openapi-export.md`
- Processo do agente (RPI): `docs/runbooks/rpi.md`

