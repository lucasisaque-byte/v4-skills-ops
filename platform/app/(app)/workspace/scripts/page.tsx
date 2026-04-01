'use client'

import { useState } from 'react'
import { ClientPicker } from '@/components/ClientPicker'
import { StreamOutput } from '@/components/StreamOutput'
import { WorkflowStatusBar } from '@/components/WorkflowStatusBar'
import { ApprovalPanel } from '@/components/ApprovalPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Video, Download, Loader2 } from 'lucide-react'
import { useWorkflowRun } from '@/lib/useWorkflowRun'
import type { Client } from '@/lib/store'

export default function ScriptsPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [hook, setHook] = useState('')
  const [theme, setTheme] = useState('')
  const [platform, setPlatform] = useState('Instagram Reels')
  const { phase, meta, output, error, generate, approve, rebrief, reject, reset } = useWorkflowRun()

  const isStreaming = phase === 'planning' || phase === 'streaming'
  const phaseLabel = phase === 'planning' ? 'Account Manager preparando briefing...' : 'Gerando roteiro...'

  const handleGenerate = () => {
    if (!client || !hook.trim() || !theme.trim()) return
    generate('reel_script', client.id, { hook, theme, platform })
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roteiro-${client?.id}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-pink-400/10 flex items-center justify-center">
          <Video className="w-4 h-4 text-pink-400" />
        </div>
        <h1 className="text-lg font-semibold">Script de Reels</h1>
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4">
        <ClientPicker value={client} onChange={(c) => { setClient(c); reset() }} />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hook do vídeo</label>
          <textarea
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            rows={2}
            placeholder="Ex: '73% dos seus clientes estão indo embora por causa do frete'"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Dica: use o Hook Engineer para gerar opções antes.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tema / assunto</label>
          <input
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Ex: Custo do frete na conversão de e-commerce"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plataforma</label>
          <div className="flex gap-2">
            {['Instagram Reels', 'TikTok', 'YouTube Shorts'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  platform === p
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={!client || isStreaming || !hook.trim() || !theme.trim()} className="w-full">
          {isStreaming ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />{phaseLabel}</> : 'Gerar Roteiro'}
        </Button>
      </div>

      {meta && <WorkflowStatusBar meta={meta} phase={phase} />}
      {phase === 'waiting_approval' && meta && (
        <ApprovalPanel meta={meta} onApprove={approve} onRebrief={(fb) => rebrief(fb)} onReject={reject} />
      )}
      {error && <p className="text-sm text-red-400 px-1">Erro: {error}</p>}

      {(output || isStreaming || phase === 'waiting_approval') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Roteiro</span>
              {isStreaming && <Badge variant="secondary" className="text-xs animate-pulse">{phaseLabel}</Badge>}
              {phase === 'waiting_approval' && <Badge variant="outline" className="text-xs border-amber-400/40 text-amber-300">aguardando aprovação</Badge>}
            </div>
            {output && phase === 'done' && (
              <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={download}>
                <Download className="w-3 h-3" /> Baixar .txt
              </Button>
            )}
          </div>
          <StreamOutput content={output} isStreaming={isStreaming} className="min-h-[400px] max-h-[600px]" />
        </div>
      )}
    </div>
  )
}
