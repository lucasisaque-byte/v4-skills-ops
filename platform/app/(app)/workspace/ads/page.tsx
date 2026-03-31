'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { ClientPicker } from '@/components/ClientPicker'
import { StreamOutput } from '@/components/StreamOutput'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image, Download } from 'lucide-react'
import type { Client } from '@/lib/store'

const objectives = [
  { value: 'leads', label: 'Geração de leads' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'conversion', label: 'Conversão' },
]

const platformOptions = [
  { value: 'meta-feed', label: 'Meta Feed', desc: '4:5 · 800×1000' },
  { value: 'meta-stories', label: 'Meta Stories', desc: '9:16 · 1080×1920' },
  { value: 'google', label: 'Google Display', desc: '1.91:1 · 1200×628' },
  { value: 'linkedin', label: 'LinkedIn', desc: '1.91:1 · 1200×628' },
]

const tones = [
  { value: 'urgencia', label: 'Urgência' },
  { value: 'educacional', label: 'Educacional' },
  { value: 'emocional', label: 'Emocional' },
  { value: 'prova', label: 'Prova Social' },
]

export default function AdsPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [objective, setObjective] = useState('leads')
  const [platform, setPlatform] = useState('meta-feed')
  const [offer, setOffer] = useState('')
  const [tone, setTone] = useState('urgencia')
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const generate = () => {
    if (!client || !offer.trim()) return
    setOutput('')
    setIsStreaming(true)

    api.streamGenerate(
      '/generate/ads',
      { client_id: client.id, campaign_objective: objective, platform, offer_description: offer, tone },
      (chunk) => setOutput((prev) => prev + chunk),
      () => setIsStreaming(false),
      (e) => { setIsStreaming(false); setOutput(`Erro: ${e.message}`) }
    )
  }

  const downloadHTML = () => {
    const htmlMatch = output.match(/```html\n([\s\S]*?)```/)
    const html = htmlMatch ? htmlMatch[1] : output
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `criativo-${client?.id}-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center">
          <Image className="w-4 h-4 text-orange-400" />
        </div>
        <h1 className="text-lg font-semibold">Criativo de Ads</h1>
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4">
        <ClientPicker value={client} onChange={setClient} />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Objetivo da campanha</label>
          <div className="flex gap-2">
            {objectives.map((o) => (
              <button
                key={o.value}
                onClick={() => setObjective(o.value)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  objective === o.value
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plataforma e formato</label>
          <div className="grid grid-cols-2 gap-2">
            {platformOptions.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`px-3 py-2 text-sm rounded-lg border text-left transition-colors ${
                  platform === p.value
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="font-medium">{p.label}</div>
                <div className="text-xs opacity-70">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Oferta / produto a destacar</label>
          <textarea
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            rows={2}
            placeholder="Ex: Consulta médica online por R$89, Plano mensal de telehealth..."
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tom do criativo</label>
          <div className="flex gap-2 flex-wrap">
            {tones.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  tone === t.value
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={generate} disabled={!client || isStreaming || !offer.trim()} className="w-full">
          {isStreaming ? 'Gerando criativo...' : 'Gerar Criativo'}
        </Button>
      </div>

      {(output || isStreaming) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Criativo gerado</span>
              {isStreaming && <Badge variant="secondary" className="text-xs animate-pulse">gerando...</Badge>}
            </div>
            {output && !isStreaming && (
              <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={downloadHTML}>
                <Download className="w-3 h-3" /> Download HTML
              </Button>
            )}
          </div>
          <StreamOutput content={output} isStreaming={isStreaming} className="min-h-[400px] max-h-[600px]" />
        </div>
      )}
    </div>
  )
}
