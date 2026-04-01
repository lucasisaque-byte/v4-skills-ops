'use client'

import { useState } from 'react'
import { ClientPicker } from '@/components/ClientPicker'
import { StreamOutput } from '@/components/StreamOutput'
import { WorkflowStatusBar } from '@/components/WorkflowStatusBar'
import { ApprovalPanel } from '@/components/ApprovalPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Anchor, Copy, Check, Loader2 } from 'lucide-react'
import { useWorkflowRun } from '@/lib/useWorkflowRun'
import type { Client } from '@/lib/store'

const platforms = ['Instagram', 'LinkedIn', 'TikTok/Reels']

export default function HooksPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [theme, setTheme] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [copied, setCopied] = useState(false)
  const { phase, meta, output, error, generate, approve, rebrief, reject, reset } = useWorkflowRun()

  const isStreaming = phase === 'planning' || phase === 'streaming'
  const phaseLabel = phase === 'planning' ? 'Account Manager preparando briefing...' : 'Gerando hooks...'

  const handleGenerate = () => {
    if (!theme.trim() || !client) return
    generate('hooks', client.id, { theme, platform })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
          <Anchor className="w-4 h-4 text-yellow-400" />
        </div>
        <h1 className="text-lg font-semibold">Hook Engineer</h1>
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4">
        <ClientPicker value={client} onChange={(c) => { setClient(c); reset() }} />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tema do post</label>
          <textarea
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            rows={3}
            placeholder="Ex: Vantagens do fulfillment terceirizado para e-commerces..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plataforma</label>
          <div className="flex gap-2">
            {platforms.map((p) => (
              <button key={p} onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${platform === p
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border/60 text-muted-foreground hover:text-foreground'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={!theme.trim() || !client || isStreaming} className="w-full">
          {isStreaming
            ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />{phaseLabel}</>
            : 'Gerar 5 Hooks'}
        </Button>
      </div>

      {meta && <WorkflowStatusBar meta={meta} phase={phase} />}
      {phase === 'waiting_approval' && meta && (
        <ApprovalPanel meta={meta} onApprove={approve} onRebrief={(fb) => rebrief(fb)} onReject={reject} />
      )}

      {error && (
        <p className="text-sm text-red-400 px-1">Erro: {error}</p>
      )}

      {(output || isStreaming || phase === 'waiting_approval') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resultado</span>
              {isStreaming && <Badge variant="secondary" className="text-xs animate-pulse">{phaseLabel}</Badge>}
              {phase === 'waiting_approval' && <Badge variant="outline" className="text-xs border-amber-400/40 text-amber-300">aguardando aprovação</Badge>}
            </div>
            {output && phase === 'done' && (
              <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={() => {
                navigator.clipboard.writeText(output)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}>
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar tudo'}
              </Button>
            )}
          </div>
          <StreamOutput content={output} isStreaming={isStreaming}
            className="min-h-[300px] max-h-[500px]" placeholder="Os hooks aparecerão aqui..." />
        </div>
      )}
    </div>
  )
}
