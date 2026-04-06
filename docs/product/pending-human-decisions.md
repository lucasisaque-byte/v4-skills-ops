# Pending Human Decisions — V4 Skills Ops

> Criado em 2026-04-01 durante reestruturação do repositório  
> Revisar e resolver antes de avançar para a próxima fase de evolução arquitetural

---

## PHD-001 — UCM do KCE em formato JSON

**Item:** `archive/pending-review/kce-ucm-raw.json`

**Decisão pendente:** Este arquivo (114KB) contém o UCM do cliente KCE em formato JSON estruturado. O sistema ativo usa `clients/kce/ucm.md` (formato Markdown). São versões diferentes ou o JSON é a fonte original da qual o Markdown foi derivado?

**Risco:** Se o JSON tiver dados mais ricos e atualizados que o `.md`, o sistema está usando contexto empobrecido para as skills do KCE.

**Recomendação:** 
1. Comparar conteúdo dos dois arquivos
2. Se JSON tiver mais dados → considerar atualizar `clients/kce/ucm.md` com o conteúdo expandido
3. Se forem equivalentes → deletar `archive/pending-review/kce-ucm-raw.json`

**Impacto se não resolver:** Baixo/médio — o sistema funciona com `ucm.md`, mas pode não estar usando toda a riqueza do contexto disponível.

---

## PHD-002 — Deleção definitiva de `archive/prototypes/agent-v0/`

**Item:** `archive/prototypes/agent-v0/` (orchestrator.py + config.py + __init__.py)

**Decisão pendente:** O protótipo com Anthropic SDK pode ser deletado permanentemente após período de retenção?

**Contexto:** O código documenta a intenção original de pipeline sequencial (Copy → Designer → Social Media) e o plano de usar Claude (Anthropic) como modelo. A arquitetura atual usa OpenAI e tem um workflow engine mais sofisticado. O valor é puramente histórico.

**Risco:** Nenhum operacional — não está integrado. Apenas perda de referência histórica se deletado.

**Recomendação:** Manter em `archive/` por 90 dias (até 2026-07-01), então deletar.

**Impacto se não resolver:** Nenhum impacto operacional. Apenas ocupa espaço no repo.

---

## PHD-003 — Migração de persistência para Supabase

**Item:** `data/` (WorkflowRuns) + `outputs/` (output store legado)

**Decisão pendente:** WorkflowRuns são armazenados em `data/clients/{id}/workflows/...` localmente. Em produção no Railway (filesystem efêmero), **o histórico de runs some a cada redeploy**. O mesmo problema afeta `outputs/` (histórico de entregáveis).

**Risco:** ALTO — histórico de produção está sendo perdido em cada deploy. Usuários que retornam ao sistema não encontram runs anteriores.

**Recomendação:** Migrar para Supabase PostgreSQL:
1. Criar tabela `workflow_runs` com schema de `WorkflowRun`
2. Criar tabela `outputs` para output store legado  
3. Atualizar `api/workflow/engine.py` para usar Supabase em vez de filesystem
4. Atualizar `api/services/output_store.py` idem

**Impacto se não resolver:** ALTO — perda de dados de produção a cada deploy.

---

## PHD-004 — Separação de workflow domain para `packages/`

**Item:** `api/workflow/`, `api/models/workflow.py`, `api/services/orchestrator.py`

**Decisão pendente:** BC1 (Workflow Orchestration) ainda está dentro de `api/` (camada de entrega). Arquiteturalmente correto seria extrair para `packages/workflow-engine/`.

**Risco:** Médio — pode quebrar imports e configuração de deploy (Procfile) se executado sem cuidado.

**Recomendação:** Executar como Fase 3 do restructure-plan.md quando:
- Existir pelo menos um smoke test automatizado dos endpoints principais
- Não houver deploy critico planejado nos dias seguintes

**Impacto se não resolver:** O produto funciona — é uma dívida arquitetural, não um bug. Dificulta eventual separação de workers ou CLIs que precisem do engine sem a camada HTTP.

---

## PHD-005 — `clients/kce/copywriting/` removida — confirmar intenção

**Item:** `clients/kce/copywriting/` foi removida automaticamente quando ficou vazia

**Decisão pendente:** Confirmar que não havia outros arquivos ou documentação nessa pasta além dos que foram movidos/removidos.

**O que foi feito:**
- `kce-dcc.md` removido (duplicata idêntica de `kce/dcc.md`)
- `ucm-kce` arquivado em `archive/pending-review/kce-ucm-raw.json`
- Pasta vazia, `rmdir` bem-sucedido

**Risco:** Baixo — foi verificado que `ls` retornou vazio antes do rmdir. Mas confirmar manualmente se havia material que não apareceu na varredura.

**Impacto se não resolver:** Nenhum operacional.

---

## PHD-006 — `node_modules/` raiz (orphan)

**Item:** `node_modules/` na raiz do projeto

**Decisão pendente:** Com `package.json` movido para `tooling/scripts/`, o `node_modules/` na raiz é um diretório órfão de uma instalação anterior de puppeteer. Está no `.gitignore`, mas existe localmente.

**Recomendação:** Executar `rm -rf node_modules/` na raiz. A instalação de puppeteer agora deve ser feita via `cd tooling/scripts && npm install`.

**Impacto se não resolver:** Nenhum no produto — apenas ocupa espaço em disco localmente.
