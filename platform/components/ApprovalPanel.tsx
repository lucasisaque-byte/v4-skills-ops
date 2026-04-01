'use client'

import { useState } from 'react'
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WorkflowMeta } from '@/lib/useWorkflowRun'

const GATE_LABELS: Record<string, string> = {
  briefing: 'Briefing Estratégico',
  copy:     'Copy',
  hook:     'Hooks',
  calendar: 'Calendário',
  design:   'Design Visual',
  final:    'Revisão Final',
}

interface Props {
  meta: WorkflowMeta
  onApprove: (notes?: string) => void
  onRebrief: (feedback: string) => void
  onReject: (feedback: string) => void
}

export function ApprovalPanel({ meta, onApprove, onRebrief, onReject }: Props) {
  const [mode, setMode] = useState<null | 'rebrief' | 'reject'>(null)
  const [feedback, setFeedback] = useState('')

  const gateLabel = meta.gate_type ? (GATE_LABELS[meta.gate_type] ?? meta.gate_type) : 'Output'

  function handleRebrief() {
    onRebrief(feedback)
    setFeedback('')
    setMode(null)
  }

  function handleReject() {
    onReject(feedback)
    setFeedback('')
    setMode(null)
  }

  function cancel() {
    setMode(null)
    setFeedback('')
  }

  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-amber-400/20">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
        <span className="text-xs font-semibold text-amber-300">Aguardando aprovação</span>
        <span className="text-xs text-muted-foreground/60">·</span>
        <span className="text-xs text-muted-foreground truncate">{meta.current_step_title}</span>
        <span className="ml-auto shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 font-medium">
            {gateLabel}
          </span>
        </span>
      </div>

      {/* Default actions */}
      {!mode && (
        <div className="flex items-center gap-2 px-4 py-3">
          <p className="text-xs text-muted-foreground flex-1 mr-2">
            Revise o output acima e escolha uma ação.
          </p>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs bg-green-600 hover:bg-green-500 text-white shrink-0"
            onClick={() => onApprove()}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs shrink-0"
            onClick={() => setMode('rebrief')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Pedir ajuste
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-red-400 shrink-0"
            onClick={() => setMode('reject')}
          >
            <XCircle className="w-3.5 h-3.5" />
            Rejeitar
          </Button>
        </div>
      )}

      {/* Rebrief form */}
      {mode === 'rebrief' && (
        <div className="px-4 py-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            Descreva o que precisa ser ajustado e o output será refeito com seu feedback:
          </p>
          <textarea
            autoFocus
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            rows={3}
            placeholder="Ex: Está bom mas precisa focar mais na objeção de preço, e o tom ficou muito formal..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={cancel}>
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={!feedback.trim()}
              onClick={handleRebrief}
            >
              <RefreshCw className="w-3 h-3" />
              Refazer com ajuste
            </Button>
          </div>
        </div>
      )}

      {/* Reject form */}
      {mode === 'reject' && (
        <div className="px-4 py-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            Informe o motivo da rejeição. O workflow será encerrado.
          </p>
          <textarea
            autoFocus
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            rows={3}
            placeholder="Ex: A abordagem não está alinhada com o posicionamento da marca..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={cancel}>
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs"
              disabled={!feedback.trim()}
              onClick={handleReject}
            >
              Confirmar rejeição
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
