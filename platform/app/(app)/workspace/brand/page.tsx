'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { StreamOutput } from '@/components/StreamOutput'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Palette, Download, Info } from 'lucide-react'

export default function BrandPage() {
  const { activeClient } = useStore()
  const [url, setUrl] = useState('')
  const [instagram, setInstagram] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [context, setContext] = useState('')
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const generate = () => {
    if (!url.trim()) return
    setOutput('')
    setIsStreaming(true)

    const prompt = `Analise o brand e gere o sistema completo.

**Site:** ${url}
${instagram ? `**Instagram:** @${instagram}` : ''}
${linkedin ? `**LinkedIn:** ${linkedin}` : ''}
${context ? `**Contexto adicional:** ${context}` : ''}

Entregue:
1. brand-raw.json (schema completo)
2. identidade-visual.md (guia de identidade)
3. design-system-social-media.md (regras para social)
4. design-tokens.json (variáveis CSS)`

    api.streamGenerate(
      '/generate/hooks',
      { client_id: activeClient?.id || 'new', theme: prompt, platform: 'brand-system' },
      (chunk) => setOutput((prev) => prev + chunk),
      () => setIsStreaming(false),
      (e) => { setIsStreaming(false); setOutput(`Erro: ${e.message}`) }
    )
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/markdown' })
    const url_dl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url_dl
    a.download = `brand-system-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url_dl)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center">
          <Palette className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Brand System Builder</h1>
          <p className="text-xs text-muted-foreground">Extrai identidade visual e gera guia + design tokens</p>
        </div>
      </div>

      {activeClient?.has_brand_system && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-400/10 border border-blue-400/20 text-sm text-blue-300">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            <strong>{activeClient.name}</strong> já tem um brand system. Use este formulário para criar um novo ou regenerar.
          </span>
        </div>
      )}

      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">URL do site <span className="text-red-400">*</span></label>
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

        <Button onClick={generate} disabled={isStreaming || !url.trim()} className="w-full">
          {isStreaming ? 'Extraindo brand system...' : 'Gerar Brand System'}
        </Button>
      </div>

      {(output || isStreaming) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand System</span>
              {isStreaming && <Badge variant="secondary" className="text-xs animate-pulse">extraindo...</Badge>}
            </div>
            {output && !isStreaming && (
              <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={download}>
                <Download className="w-3 h-3" /> Exportar .md
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
