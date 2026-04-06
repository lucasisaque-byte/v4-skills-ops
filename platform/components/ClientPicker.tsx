'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { ChevronDown, User } from 'lucide-react'
import type { Client } from '@/lib/store'

interface Props {
  value: Client | null
  onChange: (client: Client) => void
}

function getColor(name: string) {
  const colors = ['#E85D04', '#7209B7', '#3A86FF', '#06D6A0', '#FFB703', '#EF476F', '#118AB2', '#8338EC']
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}

export function ClientPicker({ value, onChange }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [open, setOpen] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.listClients()
      .then((data) => {
        const list: Client[] = data.clients || []
        setClients(list)
        if (!value && list.length > 0) onChange(list[0])
      })
      .catch((e: unknown) => {
        setLoadError(e instanceof Error ? e.message : 'Erro ao carregar clientes')
      })
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</label>
      {loadError && (
        <p className="text-xs text-red-400">{loadError}</p>
      )}
      <div ref={ref} className="relative inline-block w-full">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2 h-9 px-3 rounded-lg border border-border/60 bg-background text-sm hover:bg-accent transition-colors text-left"
        >
          {value ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: getColor(value.name) }} />
              <span className="flex-1 font-medium">{value.name}</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 text-muted-foreground">Selecionar cliente...</span>
            </>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>

        {open && clients.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-full rounded-lg border border-border bg-card shadow-lg z-20 overflow-hidden">
            {clients.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange(c); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getColor(c.name) }} />
                <span className="flex-1">{c.name}</span>
                {value?.id === c.id && <span className="text-xs text-muted-foreground">ativo</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
