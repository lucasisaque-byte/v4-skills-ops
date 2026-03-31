'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { ClientPicker } from '@/components/ClientPicker'
import { StreamOutput } from '@/components/StreamOutput'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Anchor, Copy, Check, Loader2, Zap } from 'lucide-react'
import type { Client } from '@/lib/store'

const platforms = ['Instagram', 'LinkedIn', 'TikTok/Reels']

type Phase = 'idle' | 'briefing' | 'generating' | 'done'

export default function HooksPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [theme, setTheme] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [output, setOutput] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [amMeta, setAmMeta] = useState<{ skill?: string; observacoes?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const phaseLabel: Record<Phase, string> = {
    idle: '',
    briefing: 'Account Manager montando briefing...',
    generating: 'Gerando hooks...',
    done: '',
  }

  const generate = () => {
    if (!theme.trim() || !client) return
    setOutput('')
    setAmMeta(null)
    setPhase('briefing')

    api.streamGenerate(
      '/generate/hooks',
      { client_id: client.id, theme, platform },
      (chunk) => setOutput((prev) => prev + chunk),
      () => setPhase('done'),
      (e) => { setPhase('idle'); setOutput(`Erro: ${e.message}`) },
      (ev, meta) => {
        if (ev === 'am_done') { setAmMeta(meta as any); setPhase('generating') }
      },
    )
  }

  const isStreaming = phase === 'briefing' || phase === 'generating'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
          <Anchor className="w-4 h-4 text-yellow-400" />
        </div>
        <h1 className="text-lg font-semibold">Hook Engineer</h1>
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4">
        <ClientPicker value={client} onChange={setClient} />

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

        <Button onClick={generate} disabled={!theme.trim() || !client || isStreaming} className="w-full">
          {isStreaming
            ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />{phaseLabel[phase]}</>
            : 'Gerar 5 Hooks'
          }
        </Button>
      </div>

      {amMeta && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-yellow-400/5 border border-yellow-400/20 text-xs text-yellow-300">
          <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">Account Manager</span>
            {amMeta.observacoes && <span className="text-yellow-300/70"> — {amMeta.observacoes}</span>}
          </div>
        </div>
      )}

      {(output || isStreaming) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resultado</span>
              {isStreaming && <Badge variant="secondary" className="text-xs animate-pulse">{phaseLabel[phase]}</Badge>}
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
          <StreamOutput
            content={output}
            isStreaming={isStreaming}
            className="min-h-[300px] max-h-[500px]"
            placeholder="Os hooks aparecerão aqui..."
          />
        </div>
      )}
    </div>
  )
}
