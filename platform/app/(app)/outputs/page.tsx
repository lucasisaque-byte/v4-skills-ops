'use client'

import { FolderOpen } from 'lucide-react'

export default function OutputsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Entregáveis</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Histórico de tudo que foi gerado na plataforma</p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">Nenhum entregável ainda</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Os entregáveis gerados aparecerão aqui quando o sistema de persistência estiver configurado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
