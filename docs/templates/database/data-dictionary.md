# Data Dictionary (template)

## Como usar

- Crie um arquivo por domínio em `docs/domains/<dominio>/data-dictionary.md` a partir deste template.
- Para filesystem/JSON: trate cada arquivo/formato como uma “entidade”.

---

### `<EntityName>` / `<table_or_resource_name>`

**Finalidade**: (1–2 frases)

**Chave primária / Identidade**:

- `id`: tipo, geração, observações

**Campos**:

- `field_name` (tipo) — descrição, regras, exemplos

**Relacionamentos**:

- `fk_field` → `other_entity.id` (cardinalidade, regras)

**Constraints / Regras**:

- NOT NULL:
- UNIQUE:
- CHECK:
- DEFAULT:

**Índices** (se aplicável):

- `idx_...` — colunas, motivo

**Operações típicas**:

- Criação:
- Atualização:
- Exclusão:

**Exemplos de registros (redigidos/sem PII real)**:

```json
{
  "id": "...",
  "...": "..."
}
```

**Notas de API** (se aplicável):

- Endpoints que retornam ou alteram:
- Campos filtráveis/ordenáveis:

**Notas de UI** (se aplicável):

- Telas que consomem:
- Regras de formulário:

