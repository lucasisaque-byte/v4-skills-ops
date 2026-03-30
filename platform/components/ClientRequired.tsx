'use client'

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

export function ClientRequired({ children }: { children: React.ReactNode }) {
  const { activeClient } = useStore()

  if (!activeClient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">Nenhum cliente selecionado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Selecione um cliente no topo da página para continuar.
          </p>
        </div>
        <Link href="/clients">
          <Button size="sm" variant="outline">Ver clientes</Button>
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
