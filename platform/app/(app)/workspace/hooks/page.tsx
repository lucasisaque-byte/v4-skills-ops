'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { ClientRequired } from '@/components/ClientRequired'
import { StreamOutput } from '@/components/StreamOutput'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Anchor, Copy, Check } from 'lucide-react'

const platforms = ['Instagram', 'LinkedIn', 'TikTok/Reels']

export default function HooksPage() {
  return (
    <ClientRequired>
      <HooksFeature />
    </ClientRequired>
  )
}

function HooksFeature() {
  const { activeClient } = useStore()
  const [theme, setTheme] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [copied, setCopied] = useState(false)
  const stopRef = useState<(() => void) | null>(null)

  const generate = () => {
    if (!theme.trim() || !activeClient) return
    setOutput('')
    setIsStreaming(true)

    const stop = api.streamGenerate(
      '/generate/hooks',
      { client_id: activeClient.id, theme, platform },
      (chunk) => setOutput((prev) => prev + chunk),
      () => setIsStreaming(false),
      (e) => { setIsStreaming(false); setOutput(`Erro: ${e.message}`) }
    )
    stopRef[1](stop)
  }

  const copyAll = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
          <Anchor className="w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Hook Engineer</h1>
          <p className="text-xs text-muted-foreground">
            5 variações para <span className="text-foreground font-medium">{activeClient?.name}</span>
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4">
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

        <Button
          onClick={generate}
          disabled={!theme.trim() || isStreaming}
          className="w-full"
        >
          {isStreaming ? 'Gerando hooks...' : 'Gerar 5 Hooks'}
        </Button>
      </div>

      {/* Output */}
      {(output || isStreaming) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resultado</span>
              {isStreaming && <Badge variant="secondary" className="text-xs animate-pulse">gerando...</Badge>}
            </div>
            {output && !isStreaming && (
              <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={copyAll}>
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
