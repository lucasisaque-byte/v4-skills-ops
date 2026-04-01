'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useWorkflowRun } from '@/lib/useWorkflowRun'
import { WorkflowStatusBar } from '@/components/WorkflowStatusBar'
import { ApprovalPanel } from '@/components/ApprovalPanel'
import { RunSidebar } from '@/components/RunSidebar'
import { ArtifactModal } from '@/components/ArtifactModal'
import { StreamOutput } from '@/components/StreamOutput'
import { Badge } from '@/components/ui/badge'

export default function RunPage() {
  const params = useParams()
  const run_id = params.run_id as string

  const { phase, meta, output, error, steps, resume, approve, rebrief, reject } = useWorkflowRun()
  const [artifact, setArtifact] = useState<{ name: string; content: string } | null>(null)

  useEffect(() => {
    if (run_id) resume(run_id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run_id])

  const isStreaming = phase === 'planning' || phase === 'streaming'

  const phaseLabel =
    phase === 'planning'  ? 'Account Manager preparando briefing...' :
    phase === 'streaming' ? `Executando ${meta?.current_step_title ?? 'step'}...` :
    ''

  // Loading state
  if (phase === 'planning' && !meta) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando workflow...</span>
      </div>
    )
  }

  // Error state
  if (phase === 'error' && !meta) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-2">
        <p className="text-sm font-medium text-red-400">Erro ao carregar workflow</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-6 min-h-full">
        {/* Sidebar — pipeline de steps */}
        <div className="w-60 shrink-0 rounded-xl border border-border/60 bg-card p-4 self-start sticky top-0">
          <RunSidebar
            steps={steps}
            currentStepId={meta?.current_step_id ?? ''}
            phase={phase}
            templateId={meta?.template_id ?? ''}
            clientName={meta?.client_name ?? ''}
            taskSummary={meta?.task_summary ?? ''}
            onArtifactOpen={setArtifact}
          />
        </div>

        {/* Painel principal */}
        <div className="flex-1 space-y-6 min-w-0">
          {meta && <WorkflowStatusBar meta={meta} phase={phase} />}

          {phase === 'waiting_approval' && meta && (
            <ApprovalPanel
              meta={meta}
              onApprove={approve}
              onRebrief={(fb) => rebrief(fb)}
              onReject={reject}
            />
          )}

          {error && (
            <p className="text-sm text-red-400 px-1">Erro: {error}</p>
          )}

          {(output || isStreaming || phase === 'waiting_approval') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {meta?.current_step_title ?? 'Output'}
                </span>
                {isStreaming && (
                  <Badge variant="secondary" className="text-xs animate-pulse">
                    {phaseLabel}
                  </Badge>
                )}
                {phase === 'waiting_approval' && (
                  <Badge variant="outline" className="text-xs border-amber-400/40 text-amber-300">
                    aguardando aprovação
                  </Badge>
                )}
                {phase === 'done' && (
                  <Badge variant="outline" className="text-xs border-green-400/40 text-green-400">
                    concluído
                  </Badge>
                )}
              </div>
              <StreamOutput
                content={output}
                isStreaming={isStreaming}
                className="min-h-[400px] max-h-[600px]"
                placeholder="O output do step aparecerá aqui..."
              />
            </div>
          )}

          {/* Estado idle / planejando sem output ainda */}
          {phase === 'planning' && !output && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground py-8">
              <Loader2 className="w-4 h-4 animate-spin" />
              Account Manager analisando contexto e definindo plano...
            </div>
          )}
        </div>
      </div>

      {/* Modal de artefato */}
      <ArtifactModal artifact={artifact} onClose={() => setArtifact(null)} />
    </>
  )
}
