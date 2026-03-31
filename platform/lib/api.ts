const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetchAPI(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, options)
  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || `API error: ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Clients
  listClients: () => fetchAPI('/clients'),
  getClient: (id: string) => fetchAPI(`/clients/${id}`),
  getClientContext: (id: string) => fetchAPI(`/clients/${id}/context`),

  // Generation — returns EventSource URL for SSE
  generateHooks: (data: object) =>
    `${API_BASE}/generate/hooks?${new URLSearchParams({ payload: JSON.stringify(data) })}`,

  // POST endpoints (non-streaming)
  postGenerate: async (endpoint: string, data: object) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  // Outputs
  listOutputs: (params?: { client_id?: string; limit?: number }) => {
    if (params?.client_id) {
      const q = params.limit ? `?limit=${params.limit}` : ''
      return fetchAPI(`/outputs/client/${params.client_id}${q}`)
    }
    const q = params?.limit ? `?limit=${params.limit}` : ''
    return fetchAPI(`/outputs${q}`)
  },
  getOutput: (id: string) => fetchAPI(`/outputs/${id}`),

  // SSE streaming helper com suporte a eventos de fase do orquestrador
  streamGenerate: (
    endpoint: string,
    data: object,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (e: Error) => void,
    onPhase?: (phase: string, meta?: object) => void,
  ) => {
    const controller = new AbortController()

    fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const raw = line.slice(6)
              if (raw === '[DONE]') { onDone(); return }
              try {
                const parsed = JSON.parse(raw)
                if (parsed.text) {
                  onChunk(parsed.text)
                } else if (parsed.event) {
                  const ev: string = parsed.event
                  if (ev.startsWith('__AM_DONE__')) {
                    try {
                      const meta = JSON.parse(ev.replace('__AM_DONE__', ''))
                      onPhase?.('am_done', meta)
                    } catch { onPhase?.('am_done') }
                  } else if (ev === '__AM_START__') {
                    onPhase?.('am_start')
                  } else if (ev === '__SKILL_START__') {
                    onPhase?.('skill_start')
                  } else if (ev.startsWith('__ERROR__')) {
                    const msg = ev.replace('__ERROR__', '')
                    onError(new Error(msg))
                    onDone()
                    return
                  }
                }
              } catch {
                onChunk(raw)
              }
            }
          }
        }
        onDone()
      })
      .catch((e) => {
        if (e.name !== 'AbortError') onError(e)
      })

    return () => controller.abort()
  },
}
