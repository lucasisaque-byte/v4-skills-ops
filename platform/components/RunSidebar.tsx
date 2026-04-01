'use client'

import { CheckCircle2, Circle, Loader2, AlertCircle, XCircle, RefreshCw, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StepInfo, WorkflowPhase } from '@/lib/useWorkflowRun'

const SKILL_LABELS: Record<string, string> = {
  'account-manager':                  'Account Manager',
  'hook-engineer':                    'Hook Engineer',
  'copywriting':                      'Copywriting',
  'editorial-calendar-builder':       'Calendário Editorial',
  'social-media-designer':            'Social Media Designer',
  'reels-script-architect':           'Reels Script',
  'brand-intel':                      'Brand Intel',
  'brand-system-builder':             'Brand System',
  'social-media-briefing-diagnostic': 'Diagnóstico Editorial',
  'creative-brief-for-design':        'Brief de Design',
  'editorial-pillar-planner':         'Pilares Editoriais',
}

function StepIcon({ status, isCurrent }: { status: string; isCurrent: boolean }) {
  if (status === 'approved' || status === 'completed') {
    return <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
  }
  if (status === 'rejected') {
    return <XCircle className="w-4 h-4 text-red-400 shrink-0" />
  }
  if (status === 'rebrief_required') {
    return <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
  }
  if (status === 'waiting_approval') {
    return (
      <span className="w-4 h-4 shrink-0 flex items-center justify-center">
        <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
      </span>
    )
  }
  if (status === 'running') {
    return <Loader2 className="w-4 h-4 text-blue-400 shrink-0 animate-spin" />
  }
  if (status === 'failed') {
    return <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
  }
  // pending / ready
  return (
    <Circle className={cn(
      'w-4 h-4 shrink-0',
      isCurrent ? 'text-foreground' : 'text-muted-foreground/40'
    )} />
  )
}

interface ArtifactLinkProps {
  artifact: { name: string; content: string; version: number }
  onClick: (artifact: { name: string; content: string }) => void
}

function ArtifactLink({ artifact, onClick }: ArtifactLinkProps) {
  return (
    <button
      onClick={() => onClick(artifact)}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 ml-1"
    >
      <FileText className="w-3 h-3" />
      <span className="underline underline-offset-2">{artifact.name}</span>
    </button>
  )
}

interface Props {
  steps: StepInfo[]
  currentStepId: string
  phase: WorkflowPhase
  templateId: string
  clientName: string
  taskSummary: string
  onArtifactOpen: (artifact: { name: string; content: string }) => void
}

export function RunSidebar({
  steps, currentStepId, phase, templateId, clientName, taskSummary, onArtifactOpen
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="space-y-0.5">
        <p className="text-sm font-semibold truncate">{clientName}</p>
        <p className="text-xs text-muted-foreground font-mono">{templateId}</p>
      </div>

      {taskSummary && (
        <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border/60 pl-2">
          {taskSummary}
        </p>
      )}

      <div className="border-t border-border/40" />

      {/* Steps */}
      <div className="flex flex-col gap-0.5">
        {steps.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2.5 animate-pulse">
                <div className="w-4 h-4 rounded-full bg-muted/40 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-muted/40 rounded w-3/4" />
                  <div className="h-2.5 bg-muted/30 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          steps.map((step) => {
            const isCurrent = step.step_id === currentStepId
            const isApproved = step.status === 'approved' || step.status === 'completed'
            const lastArtifact = step.artifacts?.[step.artifacts.length - 1]

            return (
              <div
                key={step.step_id}
                className={cn(
                  'flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors',
                  isCurrent && 'bg-accent/60',
                )}
              >
                <StepIcon status={step.status} isCurrent={isCurrent} />

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-xs leading-snug',
                    isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
                    isApproved && 'text-foreground/70',
                  )}>
                    {step.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {SKILL_LABELS[step.primary_skill] ?? step.primary_skill}
                  </p>

                  {/* Artifact link — só para steps aprovados com artefato */}
                  {isApproved && lastArtifact && (
                    <ArtifactLink artifact={lastArtifact} onClick={onArtifactOpen} />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
