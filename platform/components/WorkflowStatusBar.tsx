'use client'

import { Zap, ArrowRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkflowMeta, WorkflowPhase } from '@/lib/useWorkflowRun'

const SKILL_LABELS: Record<string, string> = {
  'account-manager':            'Account Manager',
  'hook-engineer':              'Hook Engineer',
  'copywriting':                'Copywriting',
  'editorial-calendar-builder': 'Calendário Editorial',
  'social-media-designer':      'Social Media Designer',
  'reels-script-architect':     'Reels Script',
  'brand-intel':                'Brand Intel',
  'brand-system-builder':       'Brand System',
}

function SkillBadge({ skill, dim = false }: { skill: string; dim?: boolean }) {
  const label = SKILL_LABELS[skill] ?? skill
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
      dim
        ? 'bg-muted/40 border-border/40 text-muted-foreground'
        : 'bg-yellow-400/10 border-yellow-400/30 text-yellow-300'
    )}>
      {label}
    </span>
  )
}

interface Props {
  meta: WorkflowMeta
  phase: WorkflowPhase
}

export function WorkflowStatusBar({ meta, phase }: Props) {
  const { ui_summary, observations, template_id } = meta
  const isStreaming = phase === 'streaming'
  const isWaiting = phase === 'waiting_approval'
  const isDone = phase === 'done'

  return (
    <div className={cn(
      'rounded-xl border bg-card overflow-hidden',
      isWaiting ? 'border-amber-400/30' : 'border-border/60'
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center gap-2.5 px-4 py-2.5 border-b bg-muted/20',
        isWaiting ? 'border-amber-400/20' : 'border-border/40'
      )}>
        <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
        <span className="text-xs font-medium text-muted-foreground">Workflow</span>
        <span className="text-xs text-foreground font-semibold">{template_id}</span>
        <span className="ml-auto flex items-center gap-1.5">
          {isStreaming && (
            <span className="flex gap-0.5">
              {[0,1,2].map(i => (
                <span key={i} className="w-1 h-1 rounded-full bg-yellow-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          )}
          {isDone && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />}
          <span className="text-xs text-muted-foreground">{ui_summary.current_stage_label}</span>
        </span>
      </div>

      {/* Skills pipeline */}
      <div className="flex items-center gap-2 px-4 py-2.5 flex-wrap">
        <span className="text-xs text-muted-foreground shrink-0">Skills usadas:</span>
        {ui_summary.skills_used_to_build_current_material.map((skill, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground/40" />}
            <SkillBadge skill={skill} />
          </span>
        ))}
        {ui_summary.primary_skill_for_next_step &&
         !ui_summary.skills_used_to_build_current_material.includes(ui_summary.primary_skill_for_next_step) && (
          <>
            <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
            <SkillBadge skill={ui_summary.primary_skill_for_next_step} dim />
          </>
        )}
      </div>

      {/* Observações do AM */}
      {observations && (
        <div className="px-4 pb-2.5 text-xs text-muted-foreground border-t border-border/30 pt-2">
          <Clock className="w-3 h-3 inline mr-1.5 text-muted-foreground/60" />
          {observations}
        </div>
      )}
    </div>
  )
}
