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

  // SSE streaming helper
  streamGenerate: (endpoint: string, data: object, onChunk: (text: string) => void, onDone: () => void, onError: (e: Error) => void) => {
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
              const data = line.slice(6)
              if (data === '[DONE]') {
                onDone()
                return
              }
              try {
                const parsed = JSON.parse(data)
                if (parsed.text) onChunk(parsed.text)
              } catch {
                onChunk(data)
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
