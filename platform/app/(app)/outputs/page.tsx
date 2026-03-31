'use client'

import { useEffect, useState } from 'react'
import { FolderOpen, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface OutputEntry {
  id: string
  client_id: string
  client_name: string
  feature: string
  feature_label: string
  prompt_summary: string
  created_at: string
}

const FEATURE_COLORS: Record<string, string> = {
  hooks: 'text-yellow-400 bg-yellow-400/10',
  copy: 'text-green-400 bg-green-400/10',
  calendar: 'text-blue-400 bg-blue-400/10',
  ads: 'text-orange-400 bg-orange-400/10',
  'reel-script': 'text-pink-400 bg-pink-400/10',
  brand: 'text-purple-400 bg-purple-400/10',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default function OutputsPage() {
  const [outputs, setOutputs] = useState<OutputEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [detail, setDetail] = useState<(OutputEntry & { content: string }) | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.listOutputs({ limit: 50 })
      .then((res) => setOutputs(res.outputs ?? []))
      .catch(() => setOutputs([]))
      .finally(() => setLoading(false))
  }, [activeClient])

  function openDetail(id: string) {
    if (selected === id) {
      setSelected(null)
      setDetail(null)
      return
    }
    setSelected(id)
    setDetail(null)
    setDetailLoading(true)
    api.getOutput(id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Entregáveis</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Histórico de todos os clientes</p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : outputs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Nenhum entregável ainda</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Gere conteúdo em qualquer workspace para ver o histórico aqui.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {outputs.map((entry) => {
              const colorClass = FEATURE_COLORS[entry.feature] ?? 'text-muted-foreground bg-muted'
              const isOpen = selected === entry.id
              return (
                <div key={entry.id}>
                  <button
                    onClick={() => openDetail(entry.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors',
                      isOpen && 'bg-muted/40'
                    )}
                  >
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md shrink-0', colorClass)}>
                      {entry.feature_label}
                    </span>
                    <span className="text-sm truncate flex-1">{entry.prompt_summary}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{entry.client_name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(entry.created_at)}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-border/40 bg-muted/20">
                      {detailLoading ? (
                        <p className="text-xs text-muted-foreground py-4">Carregando conteúdo...</p>
                      ) : detail ? (
                        <pre className="mt-3 text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                          {detail.content}
                        </pre>
                      ) : (
                        <p className="text-xs text-muted-foreground py-4">Erro ao carregar conteúdo.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
