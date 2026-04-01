'use client'

import { useState } from 'react'
import { ClientPicker } from '@/components/ClientPicker'
import { StreamOutput } from '@/components/StreamOutput'
import { WorkflowStatusBar } from '@/components/WorkflowStatusBar'
import { ApprovalPanel } from '@/components/ApprovalPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Copy, Check, Download, Loader2 } from 'lucide-react'
import { useWorkflowRun } from '@/lib/useWorkflowRun'
import type { Client } from '@/lib/store'

const outputFormats = [
  { value: 'structured', label: 'Documento de copy' },
  { value: 'html', label: 'Copy + wireframe HTML' },
]

export default function CopyPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [campaign, setCampaign] = useState('')
  const [persona, setPersona] = useState('Todas')
  const [format, setFormat] = useState('structured')
  const [copied, setCopied] = useState(false)
  const { phase, meta, output, error, generate, approve, rebrief, reject, reset } = useWorkflowRun()

  const isStreaming = phase === 'planning' || phase === 'streaming'
  const phaseLabel = phase === 'planning' ? 'Account Manager preparando briefing...' : 'Gerando copy...'

  const handleGenerate = () => {
    if (!client) return
    generate('copy_lp', client.id, {
      campaign_description: campaign || undefined,
      persona_focus: persona === 'Todas' ? undefined : persona,
      output_format: format,
    })
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `copy-${client?.id}-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-green-400" />
        </div>
        <h1 className="text-lg font-semibold">Copy de Landing Page</h1>
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4">
        <ClientPicker value={client} onChange={(c) => { setClient(c); reset() }} />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Campanha específica <span className="normal-case font-normal">(opcional)</span>
          </label>
          <textarea
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            rows={2}
            placeholder="Ex: Lançamento do plano mensal, Black Friday, campanha de retenção..."
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Persona foco</label>
          <div className="flex gap-2 flex-wrap">
            {['Todas', 'Principal', 'Secundária'].map((p) => (
              <button key={p} onClick={() => setPersona(p)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${persona === p
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border/60 text-muted-foreground hover:text-foreground'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Formato de saída</label>
          <div className="flex gap-2">
            {outputFormats.map((f) => (
              <button key={f.value} onClick={() => setFormat(f.value)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${format === f.value
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border/60 text-muted-foreground hover:text-foreground'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={!client || isStreaming} className="w-full">
          {isStreaming ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />{phaseLabel}</> : 'Gerar Copy'}
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
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Copy gerada</span>
              {isStreaming && <Badge variant="secondary" className="text-xs animate-pulse">{phaseLabel}</Badge>}
              {phase === 'waiting_approval' && <Badge variant="outline" className="text-xs border-amber-400/40 text-amber-300">aguardando aprovação</Badge>}
            </div>
            {output && phase === 'done' && (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={() => {
                  navigator.clipboard.writeText(output); setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}>
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </Button>
                <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={download}>
                  <Download className="w-3 h-3" /> .md
                </Button>
              </div>
            )}
          </div>
          <StreamOutput content={output} isStreaming={isStreaming} className="min-h-[400px] max-h-[600px]" />
        </div>
      )}
    </div>
  )
}
