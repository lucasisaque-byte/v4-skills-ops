'use client'

import { useState } from 'react'
import { ClientPicker } from '@/components/ClientPicker'
import { StreamOutput } from '@/components/StreamOutput'
import { WorkflowStatusBar } from '@/components/WorkflowStatusBar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Palette, Download, Loader2 } from 'lucide-react'
import { useWorkflowRun } from '@/lib/useWorkflowRun'
import type { Client } from '@/lib/store'

export default function BrandPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [url, setUrl] = useState('')
  const [instagram, setInstagram] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [context, setContext] = useState('')
  const { phase, meta, output, error, generate, reset } = useWorkflowRun()

  const isStreaming = phase === 'planning' || phase === 'streaming'
  const phaseLabel = phase === 'planning' ? 'Account Manager preparando briefing...' : 'Extraindo brand system...'

  const handleGenerate = () => {
    if (!url.trim()) return
    generate('brand_system', client?.id || 'new', {
      site_url: url,
      instagram: instagram || undefined,
      linkedin: linkedin || undefined,
      additional_context: context || undefined,
    })
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/markdown' })
    const url_dl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url_dl
    a.download = `brand-system-${client?.id || 'novo'}-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url_dl)
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
        <ClientPicker value={client} onChange={(c) => { setClient(c); reset() }} />

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
            <input
              className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="@handle"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">LinkedIn</label>
            <input
              className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="/company/empresa"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
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

        <Button onClick={handleGenerate} disabled={isStreaming || !url.trim()} className="w-full">
          {isStreaming ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />{phaseLabel}</> : 'Gerar Brand System'}
        </Button>
      </div>

      {meta && <WorkflowStatusBar meta={meta} phase={phase} />}
      {error && <p className="text-sm text-red-400 px-1">Erro: {error}</p>}

      {(output || isStreaming) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand System</span>
              {isStreaming && <Badge variant="secondary" className="text-xs animate-pulse">{phaseLabel}</Badge>}
            </div>
            {output && phase === 'done' && (
              <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={download}>
                <Download className="w-3 h-3" /> Exportar .md
              </Button>
            )}
          </div>
          <StreamOutput content={output} isStreaming={isStreaming} className="min-h-[400px] max-h-[600px]" />
        </div>
      )}
    </div>
  )
}
