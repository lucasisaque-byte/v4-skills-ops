'use client'

import Link from 'next/link'
import { Image, CalendarDays, FileText, Palette, Anchor, Video, ArrowRight, Clock } from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

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
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-muted-foreground">Recentes</h2>
        </div>
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum entregável gerado ainda. Comece escolhendo uma feature acima.
          </div>
        </div>
      </div>
    </div>
  )
}
