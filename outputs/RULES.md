# Rules — `outputs/` (Artifact Store legado)

Escopo: BC6 transitório.

## O que existe hoje

- Entregáveis são persistidos em `outputs/<client_id>/entries.json`.
- A API lista entregáveis com payload reduzido (sem `content` completo) e fornece endpoint de detalhe por `id`.

## Regras de compatibilidade

- Evitar alterações breaking no formato das entries.
- Se for inevitável, adotar:
  - `schema_version` nas entries, ou
  - reader tolerante + migração incremental.

## PII / Segurança

- Não persistir dados sensíveis sem necessidade.
- Se existir PII em `content`, considerar redigir/limitar ao armazenar e ao listar.

