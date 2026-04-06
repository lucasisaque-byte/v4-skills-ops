# DB Overview (template)

> Use este template mesmo quando “DB” for filesystem/JSON. Troque “tabela” por “recurso” quando aplicável.

## Escopo

- Banco(s) / store(s):
- Tipo: Postgres/MySQL/SQLite **ou** filesystem JSON **ou** serviço externo:
- Fonte da verdade do “schema”:
  - migrations:
  - ORM schema:
  - modelos (Pydantic):
  - docs existentes:

## Convenções

- Naming (tabelas/recursos):
- Naming (campos):
- Identificadores (PK/id):
- Timestamps/auditoria:
- Soft delete (se existir):

## Domínios / Bounded Contexts

- BC:
  - Entidades/recursos:
  - Dono:
  - Consumidores (API/UI):

## Observabilidade e performance

- Métricas:
- Logs:
- Limites (paginação, payload):

