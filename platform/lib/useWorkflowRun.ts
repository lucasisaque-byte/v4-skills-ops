'use client'

import { useState, useRef } from 'react'
import { api } from '@/lib/api'

export type WorkflowPhase = 'idle' | 'planning' | 'streaming' | 'waiting_approval' | 'done' | 'error'

export interface WorkflowMeta {
  run_id: string
  template_id: string
  task_summary: string
  client_name?: string
  current_step_id: string
  current_step_title: string
  current_step_skill: string
  gate_type: string | null
  ui_summary: {
    primary_skill_for_next_step: string
    skills_used_to_build_current_material: string[]
    current_stage_label: string
  }
  observations: string
  run_status: string
}

export interface StepInfo {
  step_id: string
  title: string
  primary_skill: string
  gate_type: string | null
  status: string
  artifacts: Array<{ name: string; content: string; version: number; created_at: string }>
}

interface UseWorkflowRunReturn {
  phase: WorkflowPhase
  meta: WorkflowMeta | null
  output: string
  error: string | null
  steps: StepInfo[]
  generate: (task_type: string, client_id: string, input: object) => void
  resume: (run_id: string) => void
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
  const [steps, setSteps] = useState<StepInfo[]>([])
  const cancelRef = useRef<(() => void) | null>(null)

  function reset() {
    cancelRef.current?.()
    setPhase('idle')
    setMeta(null)
    setOutput('')
    setError(null)
    setSteps([])
  }

  function _streamStep(run_id: string, step_id: string) {
    const cancel = api.streamWorkflowStep(
      run_id,
      step_id,
      (chunk) => setOutput((prev) => prev + chunk),
      (runStatus) => {
        setMeta((prev) => prev ? { ...prev, run_status: runStatus } : prev)
        setPhase(runStatus === 'waiting_approval' ? 'waiting_approval' : 'done')
        api.getWorkflowRun(run_id).then((r) => setSteps(r.steps ?? []))
      },
      (e) => { setError(e.message); setPhase('error') },
    )
    cancelRef.current = cancel
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

        setSteps(run.steps ?? [])
        setMeta({
          run_id:               run.run_id,
          template_id:          run.template_id,
          task_summary:         run.task_summary,
          current_step_id:      firstStep.step_id,
          current_step_title:   firstStep.title ?? firstStep.step_id,
          current_step_skill:   firstStep.primary_skill,
          gate_type:            firstStep.gate_type ?? null,
          ui_summary:           run.ui_summary,
          observations:         run.observations ?? '',
          run_status:           run.status,
        })

        setPhase('streaming')
        _streamStep(run.run_id, firstStep.step_id)
      })
      .catch((e) => {
        setError(e.message)
        setPhase('error')
      })
  }

  async function resume(run_id: string) {
    cancelRef.current?.()
    setPhase('planning')
    setOutput('')
    setError(null)
    setSteps([])

    try {
      const run = await api.getWorkflowRun(run_id)
      setSteps(run.steps ?? [])

      const activeStep = (run.steps ?? []).find((s: any) =>
        ['ready', 'running', 'waiting_approval'].includes(s.status)
      )

      const uiSummary = run.runtime_plan?.ui_summary ?? {
        primary_skill_for_next_step: activeStep?.primary_skill ?? '',
        skills_used_to_build_current_material: [],
        current_stage_label: run.status,
      }

      const metaBase = {
        run_id:       run.run_id,
        template_id:  run.template_id,
        task_summary: run.task_summary,
        client_name:  run.client_name,
        ui_summary:   uiSummary,
        observations: run.runtime_plan?.observations ?? '',
        run_status:   run.status,
      }

      if (!activeStep || run.status === 'completed') {
        const lastDone = [...(run.steps ?? [])].reverse().find((s: any) => s.artifacts?.length)
        const lastArtifact = lastDone?.artifacts?.[lastDone.artifacts.length - 1]
        setMeta({
          ...metaBase,
          current_step_id:    lastDone?.step_id ?? '',
          current_step_title: lastDone?.title ?? '',
          current_step_skill: lastDone?.primary_skill ?? '',
          gate_type:          null,
        })
        setOutput(lastArtifact?.content ?? '')
        setPhase('done')
        return
      }

      setMeta({
        ...metaBase,
        current_step_id:    activeStep.step_id,
        current_step_title: activeStep.title ?? activeStep.step_id,
        current_step_skill: activeStep.primary_skill,
        gate_type:          activeStep.gate_type ?? null,
      })

      if (activeStep.status === 'waiting_approval') {
        const lastArtifact = activeStep.artifacts?.[activeStep.artifacts.length - 1]
        setOutput(lastArtifact?.content ?? '')
        setPhase('waiting_approval')
        return
      }

      // ready or running → stream
      setPhase('streaming')
      _streamStep(run.run_id, activeStep.step_id)
    } catch (e: any) {
      setError(e.message)
      setPhase('error')
    }
  }

  async function approve(notes?: string) {
    if (!meta) return
    setPhase('streaming')
    setOutput('')
    try {
      const res = await api.approveStep(meta.run_id, meta.current_step_id, notes)

      // Update steps list immediately
      setSteps((prev) => prev.map((s) =>
        s.step_id === meta.current_step_id ? { ...s, status: 'approved' } : s
      ))

      if (!res.next_step) {
        setPhase('done')
        return
      }

      setMeta((prev) => prev ? {
        ...prev,
        current_step_id:    res.next_step.step_id,
        current_step_title: res.next_step.title ?? res.next_step.step_id,
        current_step_skill: res.next_step.primary_skill,
        gate_type:          res.next_step.gate_type ?? null,
        run_status:         res.status,
      } : prev)

      _streamStep(meta.run_id, res.next_step.step_id)
    } catch (e: any) {
      setError(e.message)
      setPhase('error')
    }
  }

  async function reject(feedback: string) {
    if (!meta) return
    try {
      await api.rejectStep(meta.run_id, meta.current_step_id, feedback)
      setSteps((prev) => prev.map((s) =>
        s.step_id === meta.current_step_id ? { ...s, status: 'rejected' } : s
      ))
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
      // Refresh full steps from backend after rebrief (multiple steps may be reset)
      const run = await api.getWorkflowRun(meta.run_id)
      setSteps(run.steps ?? [])
      const restartStep = (run.steps ?? []).find((s: any) => s.step_id === res.restarting_at)
      if (restartStep) {
        setMeta((prev) => prev ? {
          ...prev,
          current_step_id:    restartStep.step_id,
          current_step_title: restartStep.title ?? restartStep.step_id,
          current_step_skill: restartStep.primary_skill,
          gate_type:          restartStep.gate_type ?? null,
        } : prev)
      }
      _streamStep(meta.run_id, res.restarting_at)
    } catch (e: any) {
      setError(e.message)
      setPhase('error')
    }
  }

  return { phase, meta, output, error, steps, generate, resume, approve, reject, rebrief, reset }
}
