'use client'

import { useState, useRef } from 'react'
import { api } from '@/lib/api'

export type WorkflowPhase = 'idle' | 'planning' | 'streaming' | 'waiting_approval' | 'done' | 'error'

export interface WorkflowMeta {
  run_id: string
  template_id: string
  task_summary: string
  current_step_id: string
  current_step_skill: string
  ui_summary: {
    primary_skill_for_next_step: string
    skills_used_to_build_current_material: string[]
    current_stage_label: string
  }
  observations: string
  run_status: string
}

interface UseWorkflowRunReturn {
  phase: WorkflowPhase
  meta: WorkflowMeta | null
  output: string
  error: string | null
  generate: (task_type: string, client_id: string, input: object) => void
  approve: (notes?: string) => Promise<void>
  reject: (feedback: string) => Promise<void>
  rebrief: (feedback: string, mode?: 'rerun_step' | 'restart_from_step', target?: string) => Promise<void>
  reset: () => void
}

export function useWorkflowRun(): UseWorkflowRunReturn {
  const [phase, setPhase] = useState<WorkflowPhase>('idle')
  const [meta, setMeta] = useState<WorkflowMeta | null>(null)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const cancelRef = useRef<(() => void) | null>(null)

  function reset() {
    cancelRef.current?.()
    setPhase('idle')
    setMeta(null)
    setOutput('')
    setError(null)
  }

  function generate(task_type: string, client_id: string, input: object) {
    reset()
    setPhase('planning')

    api.createWorkflowRun({ client_id, task_type, input })
      .then((run) => {
        const firstStep = run.current_step
        if (!firstStep) {
          setError('Nenhum step retornado pelo workflow')
          setPhase('error')
          return
        }

        setMeta({
          run_id:               run.run_id,
          template_id:          run.template_id,
          task_summary:         run.task_summary,
          current_step_id:      firstStep.step_id,
          current_step_skill:   firstStep.primary_skill,
          ui_summary:           run.ui_summary,
          observations:         run.observations ?? '',
          run_status:           run.status,
        })

        setPhase('streaming')

        const cancel = api.streamWorkflowStep(
          run.run_id,
          firstStep.step_id,
          (chunk) => setOutput((prev) => prev + chunk),
          (runStatus) => {
            setMeta((prev) => prev ? { ...prev, run_status: runStatus } : prev)
            setPhase(runStatus === 'waiting_approval' ? 'waiting_approval' : 'done')
          },
          (e) => { setError(e.message); setPhase('error') },
        )
        cancelRef.current = cancel
      })
      .catch((e) => {
        setError(e.message)
        setPhase('error')
      })
  }

  async function approve(notes?: string) {
    if (!meta) return
    setPhase('streaming')
    setOutput('')
    try {
      const res = await api.approveStep(meta.run_id, meta.current_step_id, notes)
      if (!res.next_step) {
        setPhase('done')
        return
      }
      // Atualiza meta com próximo step e faz stream
      setMeta((prev) => prev ? {
        ...prev,
        current_step_id:    res.next_step.step_id,
        current_step_skill: res.next_step.primary_skill,
        run_status:         res.status,
      } : prev)

      const cancel = api.streamWorkflowStep(
        meta.run_id,
        res.next_step.step_id,
        (chunk) => setOutput((prev) => prev + chunk),
        (runStatus) => {
          setMeta((prev) => prev ? { ...prev, run_status: runStatus } : prev)
          setPhase(runStatus === 'waiting_approval' ? 'waiting_approval' : 'done')
        },
        (e) => { setError(e.message); setPhase('error') },
      )
      cancelRef.current = cancel
    } catch (e: any) {
      setError(e.message)
      setPhase('error')
    }
  }

  async function reject(feedback: string) {
    if (!meta) return
    try {
      await api.rejectStep(meta.run_id, meta.current_step_id, feedback)
      setPhase('idle')
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function rebrief(
    feedback: string,
    mode: 'rerun_step' | 'restart_from_step' = 'rerun_step',
    target?: string,
  ) {
    if (!meta) return
    setOutput('')
    setPhase('streaming')
    try {
      const res = await api.rebriefStep(meta.run_id, meta.current_step_id, feedback, mode, target)
      const cancel = api.streamWorkflowStep(
        meta.run_id,
        res.restarting_at,
        (chunk) => setOutput((prev) => prev + chunk),
        (runStatus) => {
          setMeta((prev) => prev ? { ...prev, run_status: runStatus } : prev)
          setPhase(runStatus === 'waiting_approval' ? 'waiting_approval' : 'done')
        },
        (e) => { setError(e.message); setPhase('error') },
      )
      cancelRef.current = cancel
    } catch (e: any) {
      setError(e.message)
      setPhase('error')
    }
  }

  return { phase, meta, output, error, generate, approve, reject, rebrief, reset }
}
