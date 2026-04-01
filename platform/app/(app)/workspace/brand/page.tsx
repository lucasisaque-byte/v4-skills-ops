'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { ClientPicker } from '@/components/ClientPicker'
import { Button } from '@/components/ui/button'
import { Palette, Loader2 } from 'lucide-react'
import type { Client } from '@/lib/store'

export default function BrandPage() {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [url, setUrl] = useState('')
  const [instagram, setInstagram] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [context, setContext] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!url.trim()) return
    setCreating(true)
    setError(null)
    try {
      const run = await api.createWorkflowRun({
        client_id: client?.id || 'new',
        task_type: 'brand_system',
        input: {
          site_url: url,
          instagram: instagram || undefined,
          linkedin: linkedin || undefined,
          additional_context: context || undefined,
        },
      })
      router.push(`/workspace/runs/${run.run_id}`)
    } catch (e: any) {
      setError(e.message)
      setCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center">
          <Palette className="w-4 h-4 text-purple-400" />
        </div>
        <h1 className="text-lg font-semibold">Brand System Builder</h1>
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4">
        <ClientPicker value={client} onChange={setClient} />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            URL do site <span className="text-red-400">*</span>
          </label>
          <input
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="https://empresa.com.br"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Instagram</label>
            <input className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="@handle" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">LinkedIn</label>
            <input className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="/company/empresa" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Contexto adicional <span className="normal-case font-normal">(opcional)</span>
          </label>
          <textarea
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            rows={2}
            placeholder="Segmento, posicionamento, concorrentes, personalidade desejada..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button onClick={handleCreate} disabled={creating || !url.trim()} className="w-full">
          {creating
            ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Iniciando workflow...</>
            : 'Iniciar workflow de Brand System'}
        </Button>
      </div>
    </div>
  )
}
