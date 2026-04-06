# Change Management (template)

## Objetivo

Evoluir “schema” (DB ou formatos persistidos) sem quebrar API/clients/UI.

## Padrão recomendado

### Expand/Contract

- **Expand**: adicionar campos opcionais, endpoints novos, compatibilidade para leitura.
- **Backfill** (se necessário): popular dados antigos para novo formato.
- **Contract**: tornar obrigatório/remover campos antigos somente após consumidores migrarem.

## Checklist antes de merge

- Migração/alteração roda em ambiente limpo (quando houver DB).
- Reader tolerante a dados antigos (quando houver persistência em JSON).
- Limites/paginação revisados.
- OpenAPI exportado e diff revisado.

