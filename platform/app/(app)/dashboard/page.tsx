'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Image, CalendarDays, FileText, Palette, Anchor, Video, ArrowRight, Clock } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface OutputEntry {
  id: string
  client_name: string
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
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

const features = [
  {
    href: '/workspace/ads',
    icon: Image,
    label: 'Criativo de Ads',
    description: 'Meta, Google, LinkedIn — HTML/CSS + PNG pronto para veicular',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
  {
    href: '/workspace/social',
    icon: CalendarDays,
    label: 'Calendário Editorial',
    description: 'Calendário mensal com pilares, formatos e hooks por post',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    href: '/workspace/copy',
    icon: FileText,
    label: 'Copy de Landing Page',
    description: 'Hero, Problema, Solução, Benefícios, Prova Social, FAQ, CTA',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    href: '/workspace/brand',
    icon: Palette,
    label: 'Brand System',
    description: 'Extrai identidade visual e gera guia + design tokens',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    href: '/workspace/hooks',
    icon: Anchor,
    label: 'Hook Engineer',
    description: '5 variações de hook por tipo: contrarian, dado, lacuna...',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    href: '/workspace/scripts',
    icon: Video,
    label: 'Script de Reels',
    description: 'Roteiro completo com cenas, legenda e instruções de câmera',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
  },
]

export default function DashboardPage() {
  const { activeClient } = useStore()
  const [recentes, setRecentes] = useState<OutputEntry[]>([])

  useEffect(() => {
    const params = activeClient ? { client_id: activeClient.id, limit: 5 } : { limit: 5 }
    api.listOutputs(params)
      .then((res) => setRecentes(res.outputs ?? []))
      .catch(() => setRecentes([]))
  }, [activeClient])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {activeClient ? `O que vamos produzir para ${activeClient.name}?` : 'O que vamos produzir hoje?'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeClient
            ? 'Selecione uma feature — o contexto do cliente já está carregado.'
            : 'Selecione um cliente no topo para carregar o contexto automático.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => {
          const Icon = f.icon
          return (
            <Link
              key={f.href}
              href={f.href}
              className={cn(
                'group relative flex flex-col gap-3 p-4 rounded-xl border border-border/60 bg-card',
                'hover:border-border transition-all hover:shadow-sm'
              )}
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', f.bg)}>
                <Icon className={cn('w-4 h-4', f.color)} />
              </div>
              <div>
                <p className="font-medium text-sm">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.description}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 absolute right-4 top-4 group-hover:text-muted-foreground transition-colors" />
            </Link>
          )
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Recentes</h2>
          </div>
          {recentes.length > 0 && (
            <Link href="/outputs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Ver todos →
            </Link>
          )}
        </div>
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          {recentes.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum entregável gerado ainda. Comece escolhendo uma feature acima.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {recentes.map((entry) => {
                const colorClass = FEATURE_COLORS[entry.feature_label] ?? 'text-muted-foreground bg-muted'
                return (
                  <Link
                    key={entry.id}
                    href="/outputs"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md shrink-0', colorClass)}>
                      {entry.feature_label}
                    </span>
                    <span className="text-sm truncate flex-1 text-foreground">{entry.prompt_summary}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{entry.client_name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(entry.created_at)}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
