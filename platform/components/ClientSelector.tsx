'use client'

import { useEffect, useState } from 'react'
import { useStore, type Client } from '@/lib/store'
import { api } from '@/lib/api'
import { ChevronDown, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getClientColor(name: string) {
  const colors = [
    '#E85D04', '#7209B7', '#3A86FF', '#06D6A0', '#FFB703',
    '#EF476F', '#118AB2', '#073B4C', '#8338EC', '#FB5607',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function ClientSelector() {
  const { activeClient, setActiveClient } = useStore()
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    api.listClients()
      .then((data) => {
        setClients(data.clients || [])
        if (!activeClient && data.clients?.length > 0) {
          setActiveClient(data.clients[0])
        }
      })
      .catch(() => {})
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border/60 bg-card text-sm hover:bg-accent transition-colors">
          {activeClient ? (
            <>
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: getClientColor(activeClient.name) }}
              />
              <span className="font-medium max-w-[120px] truncate">{activeClient.name}</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Selecionar cliente</span>
            </>
          )}
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Clientes ativos</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {clients.map((client) => (
          <DropdownMenuItem
            key={client.id}
            onClick={() => setActiveClient(client)}
            className="gap-2 cursor-pointer"
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getClientColor(client.name) }}
            />
            <span className="flex-1">{client.name}</span>
            {activeClient?.id === client.id && (
              <span className="text-xs text-muted-foreground">ativo</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setActiveClient(null)}
          className="text-muted-foreground text-sm cursor-pointer"
        >
          Limpar seleção
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
