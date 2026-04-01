'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { ClientPicker } from '@/components/ClientPicker'
import { Button } from '@/components/ui/button'
import { CalendarDays, Loader2 } from 'lucide-react'
import type { Client } from '@/lib/store'

const months = [
  'Janeiro 2026', 'Fevereiro 2026', 'Março 2026', 'Abril 2026',
  'Maio 2026', 'Junho 2026', 'Julho 2026', 'Agosto 2026',
  'Setembro 2026', 'Outubro 2026', 'Novembro 2026', 'Dezembro 2026',
]
const frequencies = ['3x/semana', '5x/semana', 'Diário']
const allPlatforms = ['Instagram', 'LinkedIn', 'TikTok']

export default function SocialPage() {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const currentMonthIndex = new Date().getMonth()
  const [month, setMonth] = useState(months[currentMonthIndex] || months[3])
  const [frequency, setFrequency] = useState('3x/semana')
  const [platforms, setPlatforms] = useState(['Instagram'])
  const [objective, setObjective] = useState('')
  const [pillarMode, setPillarMode] = useState('auto')
  const [customPillars, setCustomPillars] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const togglePlatform = (p: string) =>
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])

  const handleCreate = async () => {
    if (!client || platforms.length === 0) return
    setCreating(true)
    setError(null)
    try {
      const run = await api.createWorkflowRun({
        client_id: client.id,
        task_type: 'calendar',
        input: {
          month, frequency, platforms,
          monthly_objective: objective,
          pillar_mode: pillarMode,
          custom_pillars: pillarMode === 'manual' ? customPillars : undefined,
        },
      })
      router.push(`/workspace/runs/${run.run_id}`)
    } catch (e: any) {
      setError(e.message)
      setCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center">
          <CalendarDays className="w-4 h-4 text-blue-400" />
        </div>
        <h1 className="text-lg font-semibold">Calendário Editorial</h1>
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4">
        <ClientPicker value={client} onChange={setClient} />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mês</label>
            <select className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={month} onChange={(e) => setMonth(e.target.value)}>
              {months.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Frequência</label>
            <div className="flex flex-col gap-1">
              {frequencies.map((f) => (
                <button key={f} onClick={() => setFrequency(f)}
                  className={`px-3 py-1.5 text-sm rounded-lg border text-left transition-colors ${frequency === f
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border/60 text-muted-foreground hover:text-foreground'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plataformas</label>
          <div className="flex gap-2">
            {allPlatforms.map((p) => (
              <button key={p} onClick={() => togglePlatform(p)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${platforms.includes(p)
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border/60 text-muted-foreground hover:text-foreground'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Objetivo do mês <span className="normal-case font-normal">(opcional)</span>
          </label>
          <input className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Ex: Lançamento do produto X, crescimento de seguidores..."
            value={objective} onChange={(e) => setObjective(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pilares editoriais</label>
          <div className="flex flex-col gap-1">
            {[{ value: 'auto', label: 'Gerar automaticamente (recomendado)' }, { value: 'manual', label: 'Definir manualmente' }].map((opt) => (
              <button key={opt.value} onClick={() => setPillarMode(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-lg border text-left transition-colors ${pillarMode === opt.value
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border/60 text-muted-foreground hover:text-foreground'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          {pillarMode === 'manual' && (
            <textarea className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring mt-2"
              rows={3} placeholder="Ex: 1. Educação, 2. Bastidores, 3. Prova Social, 4. Entretenimento"
              value={customPillars} onChange={(e) => setCustomPillars(e.target.value)} />
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button onClick={handleCreate} disabled={!client || creating || platforms.length === 0} className="w-full">
          {creating
            ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Iniciando workflow...</>
            : 'Iniciar workflow de Calendário'}
        </Button>
      </div>
    </div>
  )
}
