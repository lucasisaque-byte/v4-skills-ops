'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ArrowLeft, ExternalLink, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

function getClientColor(name: string) {
  const colors = ['#E85D04', '#7209B7', '#3A86FF', '#06D6A0', '#FFB703', '#EF476F', '#118AB2', '#8338EC']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const quickActions = [
  { label: 'Gerar Hooks', href: '/workspace/hooks', color: 'text-yellow-400' },
  { label: 'Copy de LP', href: '/workspace/copy', color: 'text-green-400' },
  { label: 'Calendário', href: '/workspace/social', color: 'text-blue-400' },
  { label: 'Criativo Ads', href: '/workspace/ads', color: 'text-orange-400' },
]

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { activeClient, setActiveClient } = useStore()

  useEffect(() => {
    api.getClient(id)
      .then(setClient)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-sm text-muted-foreground">
        Carregando cliente...
      </div>
    )
  }

  if (!client) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <Link href="/clients" className="text-sm text-primary mt-2 inline-block hover:underline">← Voltar</Link>
      </div>
    )
  }

  const isActive = activeClient?.id === client.id
  const color = client.brand?.tokens?.color?.primary?.['500']
    || client.brand?.tokens?.color?.primary?.DEFAULT
    || (typeof client.brand?.tokens?.color?.primary === 'string' ? client.brand?.tokens?.color?.primary : null)
    || getClientColor(client.name)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-muted-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> Clientes
          </Button>
        </Link>
      </div>

      {/* Header do cliente */}
      <div className="flex items-start gap-4 p-5 rounded-xl border border-border/60 bg-card">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          {client.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{client.name}</h1>
            {isActive && <Badge variant="secondary" className="text-xs">ativo</Badge>}
          </div>
          {client.segment && <p className="text-sm text-muted-foreground">{client.segment}</p>}
        </div>
        {!isActive && (
          <Button size="sm" variant="outline" className="shrink-0" onClick={() => setActiveClient(client)}>
            <Zap className="w-3.5 h-3.5 mr-1.5" /> Usar este cliente
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Documentos estratégicos */}
        <div className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Documentos estratégicos</h2>
          <DocRow
            label="DCC"
            ok={client.has_dcc}
            size={client.dcc_size}
          />
          <DocRow
            label="UCM"
            ok={client.has_ucm}
            size={client.ucm_size}
          />
        </div>

        {/* Brand System */}
        <div className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand System</h2>
          <DocRow label="Identidade visual" ok={client.brand?.has_identidade} />
          <DocRow label="Design system social" ok={client.brand?.has_design_system} />
          <DocRow label="Design tokens" ok={!!client.brand?.tokens} />
          {client.brand?.tokens && (
            <div className="flex gap-1.5 pt-1">
              {Object.values<any>(client.brand.tokens?.color || {})
                .slice(0, 5)
                .map((val: any, i: number) => {
                  const hex = typeof val === 'string' ? val : (val?.['500'] || val?.DEFAULT || Object.values(val || {})[0])
                  if (!hex || typeof hex !== 'string') return null
                  return (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-border/30"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Produzir para este cliente</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} onClick={() => setActiveClient(client)}>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <ExternalLink className={cn('w-3 h-3', a.color)} />
                {a.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function DocRow({ label, ok, size }: { label: string; ok: boolean; size?: number }) {
  return (
    <div className="flex items-center gap-2">
      {ok
        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
        : <XCircle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />}
      <span className={cn('text-sm flex-1', !ok && 'text-muted-foreground/50')}>{label}</span>
      {ok && size ? (
        <span className="text-xs text-muted-foreground">{Math.round(size / 1024)}KB</span>
      ) : null}
    </div>
  )
}
