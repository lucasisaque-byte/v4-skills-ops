'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { X, Image, CalendarDays, FileText, Palette, Loader2 } from 'lucide-react'
import { ClientPicker } from '@/components/ClientPicker'
import { Button } from '@/components/ui/button'
import type { Client } from '@/lib/store'

interface Props {
  open: boolean
  onClose: () => void
}

const TASK_TYPES = [
  {
    id: 'ads',
    label: 'Criativo de Ads',
    description: 'Copy + layout visual para Meta, Google, LinkedIn',
    icon: Image,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    fieldLabel: 'Oferta / produto a destacar',
    fieldPlaceholder: 'Ex: Plano mensal de telehealth por R$89...',
    required: true,
    inputKey: 'offer_description',
    defaults: { campaign_objective: 'leads', platform: 'meta-feed', tone: 'urgencia' },
  },
  {
    id: 'calendar',
    label: 'Calendário Editorial',
    description: 'Calendário mensal com pilares, formatos e hooks',
    icon: CalendarDays,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    fieldLabel: 'Objetivo do mês',
    fieldPlaceholder: 'Ex: Lançamento do produto X, crescimento de seguidores...',
    required: false,
    inputKey: 'monthly_objective',
    defaults: { frequency: '3x/semana', platforms: ['Instagram'], pillar_mode: 'auto' },
  },
  {
    id: 'landing_page',
    label: 'Copy de Landing Page',
    description: 'Copy estruturada completa para LP de alta conversão',
    icon: FileText,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    fieldLabel: 'Campanha / oferta específica',
    fieldPlaceholder: 'Ex: LP para captação de leads do produto X...',
    required: false,
    inputKey: 'campaign',
    defaults: { output_format: 'structured_copy' },
  },
  {
    id: 'brand_system',
    label: 'Brand System',
    description: 'Identidade visual, design tokens e sistema de marca',
    icon: Palette,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    fieldLabel: 'URL do site',
    fieldPlaceholder: 'https://empresa.com.br',
    required: true,
    inputKey: 'site_url',
    defaults: {},
  },
] as const

type TaskId = typeof TASK_TYPES[number]['id']

function getMonthLabel() {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  const d = new Date()
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

export function NewTaskModal({ open, onClose }: Props) {
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)

  const [selectedTask, setSelectedTask] = useState<TaskId>('ads')
  const [client, setClient] = useState<Client | null>(null)
  const [fieldValue, setFieldValue] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const task = TASK_TYPES.find((t) => t.id === selectedTask)!

  // Reset field when task changes
  useEffect(() => { setFieldValue('') }, [selectedTask])

  // ESC key
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const canSubmit = client && (!task.required || fieldValue.trim()) && !creating

  const handleCreate = async () => {
    if (!canSubmit || !client) return
    setCreating(true)
    setError(null)
    try {
      const input: Record<string, unknown> = { ...task.defaults }
      if (fieldValue.trim()) input[task.inputKey] = fieldValue.trim()
      if (task.id === 'calendar') {
        input.month = getMonthLabel()
      }
      const run = await api.createWorkflowRun({
        client_id: client.id,
        task_type: task.id,
        input,
      })
      onClose()
      router.push(`/workspace/runs/${run.run_id}`)
    } catch (e: any) {
      setError(e.message)
      setCreating(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-border/60 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <h2 className="font-semibold text-sm">Nova tarefa</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Task type grid */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tipo de entregável</p>
            <div className="grid grid-cols-2 gap-2">
              {TASK_TYPES.map((t) => {
                const Icon = t.icon
                const active = selectedTask === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTask(t.id)}
                    className={`text-left rounded-xl border p-3 transition-colors ${
                      active
                        ? 'border-primary/60 bg-primary/10'
                        : 'border-border/60 hover:border-border hover:bg-accent/30'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${t.bg} flex items-center justify-center mb-2`}>
                      <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                    </div>
                    <p className="text-xs font-medium leading-tight">{t.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{t.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Client picker */}
          <ClientPicker value={client} onChange={setClient} />

          {/* Task-specific field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {task.fieldLabel}
              {!task.required && <span className="normal-case font-normal ml-1">(opcional)</span>}
              {task.required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            <input
              className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder={task.fieldPlaceholder}
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <Button onClick={handleCreate} disabled={!canSubmit} className="w-full">
            {creating
              ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Iniciando workflow...</>
              : `Iniciar ${task.label}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
