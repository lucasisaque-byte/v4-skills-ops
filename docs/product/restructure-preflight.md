# Restructure Preflight — V4 Skills Ops

> Executado em 2026-04-01  
> Base: repository-audit.md + repository-classification.json + restructure-plan.md

---

## A. Bloqueios críticos detectados

| Item | Tipo | Severidade |
|------|------|-----------|
| Nested git repo em `outputs/via-journey/lp-b2b/` | Estrutural | ALTA |
| `index.html` na raiz | Ambiguidade de deploy | ALTA |
| DCC duplicado KCE | Risco de uso da versão errada | MÉDIA |
| Arquivos Obsidian em `clients/` | Lixo de workspace pessoal | BAIXA |
| `agent/` não integrado | Protótipo abandonado | BAIXA |
| `data/` não existe e não está no .gitignore | Persistência efêmera | MÉDIA |
| `skills/frontend-design/LICENSE.txt` | Compliance de terceiros | BAIXA |
| `package.json` raiz só existe para puppeteer | Confusão de stack | BAIXA |

---

## B. Matriz de decisão por item crítico

### B1. Nested repo `outputs/via-journey/lp-b2b/`

**Evidências coletadas:**
- `outputs/via-journey/lp-b2b/.git/` existe como diretório real (não é gitdir pointer)
- `git submodule status` não lista como submodule — é nested repo implícito
- `git ls-files outputs/via-journey/lp-b2b/index.html` → NOT TRACKED pelo parent git
- Todo o conteúdo dentro está invisível para o parent repo
- `.git/config` mostra remote apontando para o mesmo repositório pai (`v4-skills-ops.git`)
- `.claude/launch.json` referencia `outputs/via-journey/lp-b2b` para servir LP localmente
- `root/index.html` (84002 bytes) = `outputs/via-journey/lp-b2b/index.html` (84002 bytes) — IDÊNTICOS
- `root/assets/` = `outputs/via-journey/lp-b2b/assets/` — mesmos arquivos

**Risco:** Conteúdo não commitado no parent, duplicado na raiz, path referenciado em launch.json.

**Ação segura:**
1. Remover `.git` interno (tornando o diretório normal)
2. Mover conteúdo para `clients/via-journey/output/lp-b2b/`
3. Atualizar `.claude/launch.json` para novo path
4. Remover root `index.html` + `assets/` (são cópias idênticas)

**Ação que depende de validação humana:** Nenhuma — evidência é completa.

---

### B2. `index.html` na raiz

**Evidências coletadas:**
- Nenhum `vercel.json` existe na raiz nem em `platform/`
- Nenhuma configuração do Vercel (`.vercel/project.json`) encontrada
- `platform/next.config.mjs` é vazio (nextConfig = {})
- Vercel auto-detecta Next.js em `platform/` pela presença de `package.json` com next
- `index.html` referencia `assets/` com paths relativos (`src="assets/logo..."`)
- Conteúdo idêntico a `outputs/via-journey/lp-b2b/index.html`
- Nenhuma referência de domínio, CDN ou Vercel dentro do arquivo

**Conclusão:** O arquivo não está sendo servido pelo Vercel. É uma cópia local do output de cliente que vazou para a raiz. O Vercel deploy é o app Next.js em `platform/`.

**Ação segura:** Mover junto com `assets/` para `clients/via-journey/output/lp-b2b/`.

---

### B3. DCC duplicado KCE

**Evidências coletadas:**
- `clients/kce/dcc.md` — 745 linhas
- `clients/kce/copywriting/kce-dcc.md` — 745 linhas
- `diff` confirma: **IDÊNTICOS**
- API usa `rglob` em `_find_file()` — encontra `clients/kce/dcc.md` primeiro (raiz tem prioridade)
- O arquivo `copywriting/kce-dcc.md` nunca é usado pelo sistema ativo

**Ação segura:** Remover `clients/kce/copywriting/kce-dcc.md`.

---

### B4. `clients/kce/copywriting/ucm-kce`

**Evidências coletadas:**
- É um **arquivo JSON** (114KB), não um diretório nem um `.md`
- Contém `document_type: use_case_map` — formato rico com mais dados
- `clients/kce/ucm.md` existe (também é JSON no interior) e é o que o `rglob ucm.md` encontra
- API encontra apenas `ucm.md` — `ucm-kce` (sem extensão) nunca é carregado pelo sistema
- Provavelmente gerado pela skill `brand-intel` ou ferramenta anterior

**Ação segura:** Arquivar em `archive/pending-review/kce-ucm-raw.json`. Não deletar — pode conter dados mais ricos que `ucm.md`.

---

### B5. Arquivos Obsidian e workspace pessoal

**Evidências coletadas:**
- `clients/.obsidian/` — diretório de config do vault Obsidian
- `clients/Sem título.base` — banco de dados Obsidian Bases
- `clients/Sem título.canvas` — canvas visual Obsidian
- `clients/via-journey/Sem título/` — **diretório vazio**

**Ação segura:**
- Mover `.obsidian/`, `Sem título.base`, `Sem título.canvas` → `archive/personal-workspace/`
- Remover `clients/via-journey/Sem título/` (diretório vazio, nenhum conteúdo)

---

### B6. `agent/`

**Evidências coletadas:**
- `agent/orchestrator.py` usa Anthropic SDK (Claude) — stack diferente do sistema ativo (OpenAI)
- Única importação externa: `from agent.config import ...` (interna ao módulo)
- Nenhum arquivo fora de `agent/` importa de `agent/`
- Referencia `skills/social-media/SKILL.md` que não existe (é `skills/social-media-manager/`)
- Não aparece em `Procfile`, `start.sh`, `requirements.txt`, `api/` ou `platform/`

**Ação segura:** Mover para `archive/prototypes/agent-v0/`.

---

### B7. `data/` e persistência local

**Evidências coletadas:**
- `data/` não existe no repositório
- `.gitignore` não menciona `data/`
- `api/workflow/engine.py` usa `DATA_DIR = Path(__file__).parent.parent.parent / "data"` — cria em runtime
- WorkflowRuns são criados em `data/clients/{id}/workflows/...` em runtime
- Em produção no Railway (filesystem efêmero), tudo some a cada redeploy

**Ação segura:**
- Adicionar `data/` ao `.gitignore`
- Criar `data/.gitkeep` para documentar a intenção
- Registrar como ADR pendente: migração para Supabase

---

### B8. `skills/frontend-design/LICENSE.txt`

**Evidências coletadas:**
- Licença **Apache 2.0** — permissiva para uso comercial ✓
- Permite uso, modificação e distribuição com/sem código-fonte
- Apenas requer atribuição e manutenção do aviso de copyright

**Ação:** Preservar arquivo. Sem restrições de uso comercial.

---

### B9. `package.json` raiz + `node_modules/`

**Evidências coletadas:**
- `package.json` contém apenas `puppeteer` como dependência
- Criado para suportar `export-slides.js` (script de exportação de slides para cliente Via Journey)
- Não há CI, automação ou deploy que use este package.json
- `node_modules/` já está no `.gitignore`

**Ação segura:** Mover `package.json` e `package-lock.json` para `tooling/scripts/`. Remover da raiz.

---

## C. Plano de execução

### C1. Execução segura imediata (Nível 1)

| # | Ação | De | Para |
|---|------|----|------|
| 1 | Criar estrutura de diretórios | — | `archive/personal-workspace/`, `archive/prototypes/`, `archive/pending-review/`, `tooling/scripts/`, `docs/adr/`, `docs/runbooks/`, `clients/via-journey/output/lp-b2b/` |
| 2 | Mover PLATFORM_BRIEFING.md | raiz | `docs/product/platform-briefing.md` |
| 3 | Arquivar agent/ | `agent/` | `archive/prototypes/agent-v0/` |
| 4 | Mover export-slides.js | raiz | `tooling/scripts/export-slides.js` |
| 5 | Mover package.json raiz | raiz | `tooling/scripts/package.json` |
| 6 | Mover plano-execucao.docx | raiz | `docs/product/` |
| 7 | Mover proximos-passos.html | raiz | `docs/product/` |
| 8 | Mover arquivos Obsidian | `clients/` | `archive/personal-workspace/` |
| 9 | Remover Sem título/ vazio | `clients/via-journey/Sem título/` | DELETE |
| 10 | Mover docs/arquitetura-agente-v4.txt | `docs/` | `docs/adr/001-agent-v0-architecture.md` |
| 11 | Mover skill-brand-design-system.txt | `docs/` | `skills/brand-system-builder/references/design-system-guide.md` |

### C2. Execução condicionada — com evidência técnica (Nível 2)

| # | Ação | De | Para | Evidência |
|---|------|----|------|-----------|
| 12 | Remover .git nested repo | `outputs/via-journey/lp-b2b/.git/` | DELETE | Não trackado, mesmo remote, duplicado |
| 13 | Mover LP B2B | `outputs/via-journey/lp-b2b/` | `clients/via-journey/output/lp-b2b/` | Conteúdo idêntico, launch.json usa este path |
| 14 | Remover root index.html | raiz | DELETE | Idêntico ao que foi movido |
| 15 | Mover assets/ | raiz | `clients/via-journey/output/lp-b2b/assets/` | Mesmos arquivos, já existem na nova dest |
| 16 | Remover kce-dcc.md | `clients/kce/copywriting/` | DELETE | Idêntico a kce/dcc.md |
| 17 | Arquivar ucm-kce | `clients/kce/copywriting/ucm-kce` | `archive/pending-review/kce-ucm-raw.json` | JSON não lido pela API |
| 18 | Renomear criativos KCE | `clients/kce/criativos/` | `clients/kce/output/` | Padronizar nomenclatura |
| 19 | Atualizar .claude/launch.json | — | Novo path da LP | Referência ao path movido |

### C3. Pendências humanas (Nível 3)

| # | Item | Por que pendente |
|---|------|-----------------|
| A | Decidir se `kce/copywriting/ucm-kce` JSON tem mais dados que `kce/ucm.md` e deve substituí-lo | Conteúdo diferente, decisão estratégica |
| B | Confirmar se `clients/kce/copywriting/` pode ser removida após esvaziamento | Verificar se há outros arquivos ou valor histórico |
| C | Planejar migração para Supabase para `data/` | Requer setup externo |
| D | Confirmar se `agent/` pode ser deletado definitivamente após período em archive | Valor histórico subjetivo |
