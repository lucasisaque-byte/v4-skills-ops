# Migration Log — V4 Skills Ops Repository Restructuring

> Data: 2026-04-01  
> Executado por: Claude Code (Principal Architect mode)  
> Base: repository-audit.md + repository-classification.json + restructure-plan.md + restructure-preflight.md

---

## Sumário

| Tipo de ação | Qtd |
|-------------|-----|
| Movidos | 15 |
| Renomeados | 1 |
| Arquivados | 9 grupos |
| Removidos | 6 |
| Criados (dirs) | 8 |
| Configs atualizados | 2 |

---

## Diretórios criados

| Diretório | Propósito |
|-----------|-----------|
| `archive/personal-workspace/` | Isolamento de workspace pessoal (Obsidian) |
| `archive/prototypes/` | Protótipos abandonados |
| `archive/pending-review/` | Itens que precisam de decisão humana |
| `tooling/scripts/` | Scripts utilitários movidos da raiz |
| `docs/adr/` | Architecture Decision Records |
| `docs/runbooks/` | Guias operacionais |
| `clients/via-journey/output/lp-b2b/` | Destino da LP B2B consolidada |
| `data/` | Runtime data (com .gitkeep, não commitado) |

---

## Arquivos movidos

| # | De | Para | Motivo |
|---|----|----|--------|
| 1 | `PLATFORM_BRIEFING.md` | `docs/product/platform-briefing.md` | Não é README — é documentação de produto |
| 2 | `agent/orchestrator.py` | `archive/prototypes/agent-v0/orchestrator.py` | Protótipo abandonado (Anthropic SDK) |
| 3 | `agent/config.py` | `archive/prototypes/agent-v0/config.py` | Protótipo abandonado |
| 4 | `agent/__init__.py` | `archive/prototypes/agent-v0/__init__.py` | Protótipo abandonado |
| 5 | `export-slides.js` | `tooling/scripts/export-slides.js` | Script utilitário de cliente, não pertence à raiz |
| 6 | `package.json` (raiz) | `tooling/scripts/package.json` | Existia apenas para export-slides.js |
| 7 | `package-lock.json` (raiz) | `tooling/scripts/package-lock.json` | Idem |
| 8 | `plano-execucao-v4-skills-ops.docx` | `docs/product/plano-execucao.docx` | Planejamento estratégico |
| 9 | `proximos-passos-v4-skills-ops.html` | `docs/product/proximos-passos.html` | Roadmap histórico |
| 10 | `clients/.obsidian/` | `archive/personal-workspace/.obsidian/` | Workspace pessoal Obsidian |
| 11 | `clients/Sem título.base` | `archive/personal-workspace/Sem título.base` | Arquivo Obsidian |
| 12 | `clients/Sem título.canvas` | `archive/personal-workspace/Sem título.canvas` | Arquivo Obsidian |
| 13 | `docs/arquitetura-agente-v4.txt` | `docs/adr/001-agent-v0-architecture.md` | Documento histórico de arquitetura → ADR |
| 14 | `docs/skill-brand-design-system.txt` | `skills/brand-system-builder/references/design-system-guide.md` | Pertence à skill, não à docs/ raiz |
| 15 | `clients/kce/copywriting/ucm-kce` | `archive/pending-review/kce-ucm-raw.json` | JSON UCM não lido pela API, aguarda decisão |

---

## LP B2B Via Journey — consolidação de duplicatas

**Problema:** Conteúdo idêntico existia em 3 locais diferentes:
- `index.html` (raiz) — 84002 bytes
- `outputs/via-journey/lp-b2b/index.html` — 84002 bytes (nested repo)
- `assets/` (raiz) — 6 arquivos idênticos a `outputs/via-journey/lp-b2b/assets/`

**Ação executada:**
1. Removido `.git` interno de `outputs/via-journey/lp-b2b/` (era nested repo não trackado)
2. Conteúdo movido para `clients/via-journey/output/lp-b2b/` (location semântica correta)
3. `index.html` raiz removido (duplicata)
4. `assets/` raiz removida (duplicata)
5. `.claude/launch.json` atualizado para apontar ao novo path

---

## Renomeações

| De | Para | Motivo |
|----|------|--------|
| `clients/kce/criativos/` | `clients/kce/output/` | Padronizar nomenclatura com outros clientes |

---

## Itens arquivados

| Item | Destino | Motivo |
|------|---------|--------|
| `agent/` (completo) | `archive/prototypes/agent-v0/` | Protótipo Anthropic SDK não integrado |
| `clients/.obsidian/` | `archive/personal-workspace/` | Workspace pessoal |
| `clients/Sem título.base` | `archive/personal-workspace/` | Arquivo Obsidian |
| `clients/Sem título.canvas` | `archive/personal-workspace/` | Arquivo Obsidian |
| `clients/Sem título/` (vazio) | `archive/personal-workspace/clients-Sem-titulo/` | Dir vazio de workspace pessoal |
| `clients/via-journey/Sem título/` (vazio) | Removido | Diretório vazio, sem conteúdo |
| `clients/kce/copywriting/ucm-kce` | `archive/pending-review/kce-ucm-raw.json` | JSON UCM não usado pela API |

---

## Itens removidos

| Item | Motivo | Evidência |
|------|--------|-----------|
| `index.html` (raiz) | Duplicata idêntica de `clients/via-journey/output/lp-b2b/index.html` | md5/wc -c idênticos |
| `assets/` (raiz) | Duplicata idêntica de `clients/via-journey/output/lp-b2b/assets/` | Mesmos arquivos |
| `clients/kce/copywriting/kce-dcc.md` | Duplicata idêntica de `clients/kce/dcc.md` | `diff` retornou vazio |
| `clients/kce/copywriting/` (pasta) | Ficou vazia após remoção de kce-dcc.md e arquivamento de ucm-kce | `rmdir` bem-sucedido |
| `clients/via-journey/Sem título/` | Diretório vazio, sem conteúdo | `ls` retornou vazio |
| `outputs/via-journey/lp-b2b/.git` | Nested repo implícito (não declarado em .gitmodules) | `git ls-files` confirmou não-tracking |

---

## Configs atualizados

### `.claude/launch.json`
- **`LP Via Journey` configuration:** path atualizado de `outputs/via-journey/lp-b2b` para `clients/via-journey/output/lp-b2b`

### `.gitignore`
- Adicionado: `data/` (runtime data não deve ser commitado)
- Adicionado: `**/__pycache__/` (cobertura mais abrangente)
- Adicionado: `*.pyo`
- Adicionado: `clients/.obsidian/` (proteção contra re-commit do workspace Obsidian)
- Adicionado: `**/*.canvas`, `**/*.base`
- Adicionado: `platform/tsconfig.tsbuildinfo`

---

## Validação de integridade pós-migração

```
✅ api.main importa sem erros
✅ 7 workflow templates carregados corretamente
✅ 5 clientes listados corretamente (sem "Sem título" espúrio)
✅ KCE: dcc=True, ucm=True
✅ Via Journey: dcc=True, ucm=True
✅ hook-engineer/SKILL.md carregado (6637 chars)
✅ account-manager/SKILL.md carregado (9317 chars)
✅ skills/ e clients/ encontrados pelos path resolvers de api/services/
```

---

## Pontos que exigem revisão humana

Ver `docs/product/pending-human-decisions.md` para lista completa.

Resumo:
1. `archive/pending-review/kce-ucm-raw.json` — decidir se JSON UCM tem dados mais ricos que `kce/ucm.md`
2. Confirmação se `archive/prototypes/agent-v0/` pode ser deletado definitivamente
3. Migração de persistência de `data/` e `outputs/` para Supabase
