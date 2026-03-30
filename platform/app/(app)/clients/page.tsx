'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useStore, type Client } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function getClientColor(name: string) {
  const colors = ['#E85D04', '#7209B7', '#3A86FF', '#06D6A0', '#FFB703', '#EF476F', '#118AB2', '#8338EC']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const { activeClient, setActiveClient } = useStore()

  useEffect(() => {
    api.listClients()
      .then((d) => setClients(d.clients || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{clients.length} clientes cadastrados</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          Carregando clientes...
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden divide-y divide-border/60">
          {clients.map((client) => (
            <div key={client.id} className={cn('flex items-center gap-4 px-4 py-3 hover:bg-accent/30 transition-colors', activeClient?.id === client.id && 'bg-accent/20')}>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold shrink-0"
                style={{ backgroundColor: getClientColor(client.name) }}
              >
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{client.name}</p>
                  {activeClient?.id === client.id && (
                    <Badge variant="secondary" className="text-xs py-0">ativo</Badge>
                  )}
                </div>
                {client.segment && <p className="text-xs text-muted-foreground truncate">{client.segment}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge label="Brand" ok={client.has_brand_system} />
                <StatusBadge label="DCC" ok={client.has_dcc} />
                <StatusBadge label="UCM" ok={client.has_ucm} />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setActiveClient(client)}>
                  {activeClient?.id === client.id ? 'Ativo' : 'Usar'}
                </Button>
                <Link href={`/clients/${client.id}`}>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {ok
        ? <CheckCircle2 className="w-3 h-3 text-green-400" />
        : <XCircle className="w-3 h-3 text-muted-foreground/40" />}
      <span className={cn('text-xs', ok ? 'text-foreground' : 'text-muted-foreground/40')}>{label}</span>
    </div>
  )
}
