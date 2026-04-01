'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RunCard {
  run_id: string
  client_id: string
  client_name: string
  task_type: string
  task_summary: string
  status: string
  updated_at: string
}

const TASK_LABELS: Record<string, string> = {
  ads: 'Criativo de Ads',
  calendar: 'Calendário Editorial',
  landing_page: 'Copy de LP',
  brand_system: 'Brand System',
  hooks: 'Hooks',
  reel_script: 'Script de Reels',
}

const TASK_COLORS: Record<string, string> = {
  ads: 'bg-orange-400/15 text-orange-300',
  calendar: 'bg-blue-400/15 text-blue-300',
  landing_page: 'bg-green-400/15 text-green-300',
  brand_system: 'bg-purple-400/15 text-purple-300',
  hooks: 'bg-yellow-400/15 text-yellow-300',
  reel_script: 'bg-pink-400/15 text-pink-300',
}

const COLUMNS = [
  {
    id: 'active',
    label: 'Em execução',
    statuses: ['draft', 'planned', 'in_progress'],
    dot: 'bg-blue-400',
  },
  {
    id: 'waiting',
    label: 'Aguardando aprovação',
    statuses: ['waiting_approval', 'rebrief_required'],
    dot: 'bg-amber-400',
  },
  {
    id: 'done',
    label: 'Concluído',
    statuses: ['completed'],
    dot: 'bg-green-400',
  },
  {
    id: 'rejected',
    label: 'Rejeitado / Erro',
    statuses: ['rejected', 'failed'],
    dot: 'bg-red-400',
  },
] as const

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

function getColor(name: string) {
  const colors = ['#E85D04', '#7209B7', '#3A86FF', '#06D6A0', '#FFB703', '#EF476F', '#118AB2', '#8338EC']
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}

function KanbanCard({ run }: { run: RunCard }) {
  return (
    <Link
      href={`/workspace/runs/${run.run_id}`}
      className="block p-3 rounded-xl border border-border/60 bg-card hover:border-border hover:bg-accent/30 transition-colors group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: getColor(run.client_name) }}
        />
        <span className="text-xs text-muted-foreground font-medium truncate flex-1">{run.client_name}</span>
        <span className="text-[10px] text-muted-foreground">{timeAgo(run.updated_at)}</span>
      </div>

      <p className="text-xs font-medium leading-snug text-foreground/90 line-clamp-2 mb-2">
        {run.task_summary || TASK_LABELS[run.task_type] || run.task_type}
      </p>

      <span className={cn(
        'inline-block text-[10px] font-medium px-2 py-0.5 rounded-full',
        TASK_COLORS[run.task_type] ?? 'bg-muted text-muted-foreground'
      )}>
        {TASK_LABELS[run.task_type] ?? run.task_type}
      </span>
    </Link>
  )
}

export default function ProducaoPage() {
  const [runs, setRuns] = useState<RunCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listAllWorkflowRuns(200)
      setRuns(data.runs ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const getColumn = (col: typeof COLUMNS[number]) =>
    runs.filter((r) => (col.statuses as readonly string[]).includes(r.status))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Painel de Produção</h1>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Atualizar
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400">Erro ao carregar runs: {error}</p>
      )}

      {loading && runs.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Carregando...
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const cards = getColumn(col)
            return (
              <div key={col.id} className="space-y-2">
                {/* Column header */}
                <div className="flex items-center gap-2 px-0.5">
                  <span className={cn('w-2 h-2 rounded-full shrink-0', col.dot)} />
                  <span className="text-xs font-medium text-muted-foreground">{col.label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {cards.length === 0 ? (
                    <div className="border border-dashed border-border/40 rounded-xl h-16 flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground/50">vazio</span>
                    </div>
                  ) : (
                    cards.map((run) => <KanbanCard key={run.run_id} run={run} />)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
