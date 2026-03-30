'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { ClientRequired } from '@/components/ClientRequired'
import { StreamOutput } from '@/components/StreamOutput'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Copy, Check, Download } from 'lucide-react'

const outputFormats = [
  { value: 'structured', label: 'Documento de copy' },
  { value: 'html', label: 'Copy + wireframe HTML' },
]

export default function CopyPage() {
  return (
    <ClientRequired>
      <CopyFeature />
    </ClientRequired>
  )
}

function CopyFeature() {
  const { activeClient } = useStore()
  const [campaign, setCampaign] = useState('')
  const [persona, setPersona] = useState('Todas')
  const [format, setFormat] = useState('structured')
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = () => {
    if (!activeClient) return
    setOutput('')
    setIsStreaming(true)

    api.streamGenerate(
      '/generate/copy',
      {
        client_id: activeClient.id,
        campaign_description: campaign || undefined,
        persona_focus: persona === 'Todas' ? undefined : persona,
        output_format: format,
      },
      (chunk) => setOutput((prev) => prev + chunk),
      () => setIsStreaming(false),
      (e) => { setIsStreaming(false); setOutput(`Erro: ${e.message}`) }
    )
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `copy-${activeClient?.id}-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Copy de Landing Page</h1>
          <p className="text-xs text-muted-foreground">
            Baseado no DCC + UCM de <span className="text-foreground font-medium">{activeClient?.name}</span>
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4">
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
              <button
                key={p}
                onClick={() => setPersona(p)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  persona === p
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Formato de saída</label>
          <div className="flex gap-2">
            {outputFormats.map((f) => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  format === f.value
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={generate} disabled={isStreaming} className="w-full">
          {isStreaming ? 'Gerando copy...' : 'Gerar Copy'}
        </Button>
      </div>

      {(output || isStreaming) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Copy gerada</span>
              {isStreaming && <Badge variant="secondary" className="text-xs animate-pulse">gerando...</Badge>}
            </div>
            {output && !isStreaming && (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={() => {
                  navigator.clipboard.writeText(output)
                  setCopied(true)
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
          <StreamOutput
            content={output}
            isStreaming={isStreaming}
            className="min-h-[400px] max-h-[600px]"
          />
        </div>
      )}
    </div>
  )
}
