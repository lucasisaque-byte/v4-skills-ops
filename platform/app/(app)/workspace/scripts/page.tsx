'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { ClientRequired } from '@/components/ClientRequired'
import { StreamOutput } from '@/components/StreamOutput'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Video, Download } from 'lucide-react'

export default function ScriptsPage() {
  return (
    <ClientRequired>
      <ScriptsFeature />
    </ClientRequired>
  )
}

function ScriptsFeature() {
  const { activeClient } = useStore()
  const [hook, setHook] = useState('')
  const [theme, setTheme] = useState('')
  const [platform, setPlatform] = useState('Instagram Reels')
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const generate = () => {
    if (!activeClient || !hook.trim() || !theme.trim()) return
    setOutput('')
    setIsStreaming(true)

    api.streamGenerate(
      '/generate/reel-script',
      { client_id: activeClient.id, hook, theme, platform },
      (chunk) => setOutput((prev) => prev + chunk),
      () => setIsStreaming(false),
      (e) => { setIsStreaming(false); setOutput(`Erro: ${e.message}`) }
    )
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roteiro-${activeClient?.id}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-pink-400/10 flex items-center justify-center">
          <Video className="w-4 h-4 text-pink-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Script de Reels</h1>
          <p className="text-xs text-muted-foreground">
            Para <span className="text-foreground font-medium">{activeClient?.name}</span>
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4">
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

        <Button
          onClick={generate}
          disabled={isStreaming || !hook.trim() || !theme.trim()}
          className="w-full"
        >
          {isStreaming ? 'Gerando roteiro...' : 'Gerar Roteiro'}
        </Button>
      </div>

      {(output || isStreaming) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Roteiro</span>
              {isStreaming && <Badge variant="secondary" className="text-xs animate-pulse">gerando...</Badge>}
            </div>
            {output && !isStreaming && (
              <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={download}>
                <Download className="w-3 h-3" /> Baixar .txt
              </Button>
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
