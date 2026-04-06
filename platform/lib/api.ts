/**
 * Chamadas à API FastAPI passam pelo proxy same-origin `/api/backend` (Route Handler no Next.js),
 * que injeta `WORKFLOW_API_TOKEN` só no servidor — o segredo nunca vai ao browser.
 *
 * O POST /workflow-runs pode demorar (Anthropic); o proxy usa `maxDuration` no route handler.
 * Em deploy serverless, configure limite de duração compatível com o plano (ex.: Vercel).
 */
const DEFAULT_PROXY_BASE = '/api/backend'
const DEFAULT_DEV_UPSTREAM = 'http://localhost:8000'

function isAbsoluteHttpUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Base para fetch no browser: proxy Next.js (credencial no servidor).
 * Em SSR raro, URL upstream direta (sem token — não usar para workflow sem outro mecanismo).
 */
function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const raw = process.env.NEXT_PUBLIC_WORKFLOW_PROXY_BASE || DEFAULT_PROXY_BASE
    return raw.replace(/\/$/, '')
  }
  const raw =
    process.env.WORKFLOW_API_UPSTREAM_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    DEFAULT_DEV_UPSTREAM
  if (!isAbsoluteHttpUrl(raw)) {
    throw new Error(
      'Em SSR, WORKFLOW_API_UPSTREAM_URL ou NEXT_PUBLIC_API_URL deve ser uma URL http(s) absoluta.',
    )
  }
  return raw.replace(/\/$/, '')
}

/** Mensagem amigável quando o fetch falha antes de qualquer resposta HTTP (rede, CORS, servidor fora do ar). */
const ERRO_REDE_PT =
  'Não foi possível contactar a API. Verifique sua conexão ou se o servidor está no ar.'

function mapNetworkError(e: unknown): Error {
  if (e instanceof Error && e.name === 'AbortError') return e
  if (e instanceof TypeError) {
    const m = e.message.toLowerCase()
    if (
      m.includes('failed to fetch') ||
      m.includes('networkerror') ||
      m.includes('load failed') ||
      m.includes('network request failed')
    ) {
      return new Error(ERRO_REDE_PT)
    }
  }
  return e instanceof Error ? e : new Error(String(e))
}

async function fetchAPI(path: string, options?: RequestInit) {
  let res: Response
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  }
  try {
    res = await fetch(`${getApiBase()}${path}`, { ...options, headers })
  } catch (e) {
    throw mapNetworkError(e)
  }
  if (!res.ok) {
    const text = await res.text()
    let msg = text || `Erro na API (${res.status})`
    try {
      const j = JSON.parse(text) as { detail?: unknown }
      if (j.detail !== undefined) {
        msg = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail)
      }
    } catch {
      /* manter texto cru (ex.: HTML "Internal Server Error") */
    }
    throw new Error(msg)
  }
  return res.json()
}

function postJSON(path: string, data: object) {
  return fetchAPI(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

// ─── SSE reader (reusável para GET e POST streams) ────────────────────────────

async function readSSE(
  res: Response,
  onChunk: (text: string) => void,
  onEvent: (event: string, payload: object) => void,
  onDone: () => void,
  onError: (e: Error) => void,
) {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const lines = decoder.decode(value).split('\n')
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6)
      if (raw === '[DONE]') { onDone(); return }
      try {
        const parsed = JSON.parse(raw)
        if (parsed.text) {
          onChunk(parsed.text)
        } else if (parsed.event) {
          const ev: string = parsed.event
          if (ev.startsWith('__ERROR__')) {
            onError(new Error(ev.replace('__ERROR__', '')))
            onDone()
            return
          }
          onEvent(ev, parsed)
        }
      } catch {
        onChunk(raw)
      }
    }
  }
  onDone()
}

export type WorkflowRunPayload = {
  run_id: string
  status: string
  task_summary?: string
  template_id?: string
  planning_progress?: string | null
  planning_error?: string | null
  /** ISO timestamp — atualizado durante o planejamento (heartbeat). */
  planning_heartbeat_at?: string | null
  /** Quantas vezes o job de planejamento foi iniciado (inclui retentativas após crash). */
  planning_attempt?: number
  /** Mensagem quando o servidor reiniciou o planejamento após interrupção. */
  planning_retry_note?: string | null
  steps?: unknown[]
  runtime_plan?: { ui_summary?: unknown; observations?: string }
  client_name?: string
  task_type?: string
  current_step_id?: string | null
}

export const api = {
  // ─── Config ─────────────────────────────────────────────────────────────────
  getConfig: () => fetchAPI('/config'),
  setConfig: (data: { model?: string; max_tokens?: number }) =>
    postJSON('/config', data),

  // ─── Clients ────────────────────────────────────────────────────────────────
  listClients: () => fetchAPI('/clients'),
  getClient: (id: string) => fetchAPI(`/clients/${id}`),
  getClientContext: (id: string) => fetchAPI(`/clients/${id}/context`),

  // ─── Outputs ────────────────────────────────────────────────────────────────
  listOutputs: (params?: { client_id?: string; limit?: number }) => {
    if (params?.client_id) {
      const q = params.limit ? `?limit=${params.limit}` : ''
      return fetchAPI(`/outputs/client/${params.client_id}${q}`)
    }
    const q = params?.limit ? `?limit=${params.limit}` : ''
    return fetchAPI(`/outputs${q}`)
  },
  getOutput: (id: string) => fetchAPI(`/outputs/${id}`),

  // ─── Workflow Runs ───────────────────────────────────────────────────────────
  createWorkflowRun: (data: {
    client_id: string
    task_type: string
    input: object
    model?: string
  }) => postJSON('/workflow-runs', data),

  getWorkflowRun: (run_id: string) => fetchAPI(`/workflow-runs/${run_id}`) as Promise<WorkflowRunPayload>,

  /**
   * Aguarda o run sair de status `planning` (polling). Falha se o run passar a `failed` no planejamento.
   */
  pollWorkflowRunUntilReady: async (
    run_id: string,
    options?: {
      intervalMs?: number
      maxAttempts?: number
      onProgress?: (run: WorkflowRunPayload) => void
    },
  ): Promise<WorkflowRunPayload> => {
    const interval = options?.intervalMs ?? 1000
    const max = options?.maxAttempts ?? 300
    for (let i = 0; i < max; i++) {
      const run = (await fetchAPI(`/workflow-runs/${run_id}`)) as WorkflowRunPayload
      options?.onProgress?.(run)
      if (run.status === 'failed') {
        const stepFail = (run.steps as Array<{ status?: string; error_message?: string }> | undefined)?.find(
          (s) => s.status === 'failed',
        )
        const msg = run.planning_error || stepFail?.error_message || 'Workflow falhou'
        throw new Error(msg)
      }
      if (run.status !== 'planning') return run
      await new Promise((r) => setTimeout(r, interval))
    }
    throw new Error('Tempo esgotado aguardando o planejamento do workflow.')
  },

  listAllWorkflowRuns: (limit = 100) => fetchAPI(`/workflow-runs?limit=${limit}`),

  listClientWorkflowRuns: (client_id: string) => fetchAPI(`/clients/${client_id}/workflow-runs`),

  listWorkflowTemplates: () => fetchAPI('/workflow-runs/templates'),

  approveStep: (run_id: string, step_id: string, notes?: string) =>
    postJSON(`/workflow-runs/${run_id}/steps/${step_id}/approve`, { notes }),

  rejectStep: (run_id: string, step_id: string, feedback: string) =>
    postJSON(`/workflow-runs/${run_id}/steps/${step_id}/reject`, { feedback }),

  rebriefStep: (
    run_id: string,
    step_id: string,
    feedback: string,
    mode: 'rerun_step' | 'restart_from_step' | 'restart_entire_workflow' = 'rerun_step',
    target_step_id?: string,
  ) => postJSON(`/workflow-runs/${run_id}/steps/${step_id}/rebrief`, {
    feedback, mode, target_step_id,
  }),

  // SSE stream de um step — GET endpoint
  streamWorkflowStep: (
    run_id: string,
    step_id: string,
    onChunk: (text: string) => void,
    onDone: (runStatus: string) => void,
    onError: (e: Error) => void,
    onStepEvent?: (event: string, payload: object) => void,
  ) => {
    const controller = new AbortController()

    fetch(`${getApiBase()}/workflow-runs/${run_id}/steps/${step_id}/stream`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        await readSSE(
          res,
          onChunk,
          (ev, payload) => {
            if (ev === '__STEP_DONE__') {
              onDone((payload as any).run_status ?? 'completed')
            } else {
              onStepEvent?.(ev, payload)
            }
          },
          () => onDone('completed'),
          onError,
        )
      })
      .catch((e) => {
        if (e instanceof Error && e.name === 'AbortError') return
        onError(mapNetworkError(e))
      })

    return () => controller.abort()
  },

  // ─── Legacy: /generate/* (mantido para compatibilidade) ────────────────────
  streamGenerate: (
    endpoint: string,
    data: object & { model?: string },
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (e: Error) => void,
    onPhase?: (phase: string, meta?: object) => void,
  ) => {
    const controller = new AbortController()

    fetch(`${getApiBase()}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        await readSSE(
          res,
          onChunk,
          (ev) => {
            if (ev.startsWith('__AM_DONE__')) {
              try { onPhase?.('am_done', JSON.parse(ev.replace('__AM_DONE__', ''))) }
              catch { onPhase?.('am_done') }
            } else if (ev === '__AM_START__') onPhase?.('am_start')
            else if (ev === '__SKILL_START__') onPhase?.('skill_start')
          },
          onDone,
          onError,
        )
      })
      .catch((e) => {
        if (e instanceof Error && e.name === 'AbortError') return
        onError(mapNetworkError(e))
      })

    return () => controller.abort()
  },
}
