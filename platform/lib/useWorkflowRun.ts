'use client'

import { useState, useRef } from 'react'
import { api } from '@/lib/api'
import { useStore } from '@/lib/store'

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
  planning_progress?: string | null
  planning_heartbeat_at?: string | null
  planning_attempt?: number
  planning_retry_note?: string | null
}

export interface StepInfo {
  step_id: string
  title: string
  primary_skill: string
  gate_type: string | null
  status: string
  artifacts: Array<{ name: string; content: string; version: number; created_at: string }>
}

function asStepList(run: Record<string, unknown>): StepInfo[] {
  const s = run.steps
  if (Array.isArray(s)) return s as StepInfo[]
  return []
}

function pickFirstStepFromRun(run: Record<string, unknown>): Record<string, unknown> | null {
  const cur = run.current_step as Record<string, unknown> | undefined
  if (cur && typeof cur === 'object') return cur
  const cid = run.current_step_id as string | undefined | null
  if (cid) {
    const s = (run.steps as Array<Record<string, unknown>> | undefined)?.find(
      (x) => x.step_id === cid,
    )
    if (s) return s
  }
  return (
    (run.steps as Array<Record<string, unknown>> | undefined)?.find((s) =>
      ['ready', 'running'].includes(String(s.status)),
    ) ?? null
  )
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
  const model = useStore((s) => s.model)
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
        api.getWorkflowRun(run_id).then((r) => setSteps((r.steps ?? []) as StepInfo[]))
      },
      (e) => { setError(e.message); setPhase('error') },
    )
    cancelRef.current = cancel
  }

  function generate(task_type: string, client_id: string, input: object) {
    reset()
    setPhase('planning')

    api.createWorkflowRun({ client_id, task_type, input, model })
      .then(async (created) => {
        let run = created as Record<string, unknown>
        if (run.status === 'planning') {
          setMeta({
            run_id: run.run_id as string,
            template_id: run.template_id as string,
            task_summary: (run.task_summary as string) ?? '',
            ui_summary: {
              primary_skill_for_next_step: 'account-manager',
              skills_used_to_build_current_material: ['account-manager'],
              current_stage_label: 'Planejando workflow…',
            },
            observations: '',
            run_status: run.status as string,
            current_step_id: '',
            current_step_title: '',
            current_step_skill: '',
            gate_type: null,
            planning_progress: run.planning_progress as string | undefined,
            planning_heartbeat_at: (run.planning_heartbeat_at as string | null | undefined) ?? null,
            planning_attempt: (run.planning_attempt as number | undefined) ?? undefined,
            planning_retry_note: (run.planning_retry_note as string | null | undefined) ?? null,
          })
          run = (await api.pollWorkflowRunUntilReady(run.run_id as string, {
            onProgress: (r) => {
              setMeta((prev) =>
                prev
                  ? {
                      ...prev,
                      planning_progress: r.planning_progress ?? undefined,
                      planning_heartbeat_at: r.planning_heartbeat_at ?? null,
                      planning_attempt: r.planning_attempt,
                      planning_retry_note: r.planning_retry_note ?? null,
                    }
                  : prev,
              )
            },
          })) as Record<string, unknown>
        }
        if (run.status === 'failed') {
          const msg =
            (run.planning_error as string) ||
            ((run.steps as Array<{ error_message?: string; status?: string }>)?.find(
              (s) => s.status === 'failed',
            )?.error_message) ||
            'Workflow falhou'
          setError(msg)
          setPhase('error')
          return
        }

        const firstStep = pickFirstStepFromRun(run)
        if (!firstStep) {
          setError('Nenhum step retornado pelo workflow')
          setPhase('error')
          return
        }

        setSteps((run.steps ?? []) as StepInfo[])
        const rp = run.runtime_plan as
          | { ui_summary?: WorkflowMeta['ui_summary']; observations?: string }
          | undefined
        setMeta({
          run_id:               run.run_id as string,
          template_id:          run.template_id as string,
          task_summary:         (run.task_summary as string) ?? '',
          current_step_id:      firstStep.step_id as string,
          current_step_title:   (firstStep.title as string) ?? (firstStep.step_id as string),
          current_step_skill:   firstStep.primary_skill as string,
          gate_type:            (firstStep.gate_type as string | null) ?? null,
          ui_summary:           rp?.ui_summary ?? {
            primary_skill_for_next_step: String(firstStep.primary_skill ?? ''),
            skills_used_to_build_current_material: [],
            current_stage_label: String(run.status ?? ''),
          },
          observations:         rp?.observations ?? '',
          run_status:           run.status as string,
          planning_progress:    null,
          planning_heartbeat_at: (run.planning_heartbeat_at as string | null | undefined) ?? null,
          planning_attempt:     (run.planning_attempt as number | undefined) ?? undefined,
          planning_retry_note:  (run.planning_retry_note as string | null | undefined) ?? null,
        })

        setPhase('streaming')
        _streamStep(run.run_id as string, firstStep.step_id as string)
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e))
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
      let run = (await api.getWorkflowRun(run_id)) as Record<string, unknown>

      if (run.status === 'failed') {
        const planErr = run.planning_error as string | undefined
        const stepFailed = (run.steps as Array<{ status?: string; error_message?: string }> | undefined)?.find(
          (s) => s.status === 'failed',
        )
        const msg = planErr || stepFailed?.error_message || 'Workflow falhou'
        const uiSummary = (run.runtime_plan as { ui_summary?: WorkflowMeta['ui_summary'] } | undefined)?.ui_summary ?? {
          primary_skill_for_next_step: '',
          skills_used_to_build_current_material: [],
          current_stage_label: 'Falhou',
        }
        setMeta({
          run_id:       run.run_id as string,
          template_id:  run.template_id as string,
          task_summary: (run.task_summary as string) ?? '',
          client_name:  run.client_name as string | undefined,
          ui_summary:   uiSummary,
          observations: (run.runtime_plan as { observations?: string } | undefined)?.observations ?? '',
          run_status:   'failed',
          current_step_id:    '',
          current_step_title: '',
          current_step_skill: '',
          gate_type:          null,
          planning_progress:  null,
          planning_heartbeat_at: null,
          planning_attempt: undefined,
          planning_retry_note: null,
        })
        setError(msg)
        setPhase('error')
        return
      }

      if (run.status === 'planning') {
        const uiSummary = {
          primary_skill_for_next_step: 'account-manager',
          skills_used_to_build_current_material: ['account-manager'],
          current_stage_label: 'Planejando workflow…',
        }
        setMeta({
          run_id: run.run_id as string,
          template_id: run.template_id as string,
          task_summary: (run.task_summary as string) ?? '',
          client_name: run.client_name as string | undefined,
          ui_summary: uiSummary,
          observations: '',
          run_status: run.status as string,
          current_step_id: '',
          current_step_title: '',
          current_step_skill: '',
          gate_type: null,
          planning_progress: run.planning_progress as string | undefined,
          planning_heartbeat_at: (run.planning_heartbeat_at as string | null | undefined) ?? null,
          planning_attempt: (run.planning_attempt as number | undefined) ?? undefined,
          planning_retry_note: (run.planning_retry_note as string | null | undefined) ?? null,
        })
        setPhase('planning')
        try {
          run = (await api.pollWorkflowRunUntilReady(run_id, {
            onProgress: (r) => {
              setMeta((prev) =>
                prev
                  ? {
                      ...prev,
                      planning_progress: r.planning_progress ?? undefined,
                      planning_heartbeat_at: r.planning_heartbeat_at ?? null,
                      planning_attempt: r.planning_attempt,
                      planning_retry_note: r.planning_retry_note ?? null,
                    }
                  : prev,
              )
            },
          })) as Record<string, unknown>
        } catch (e) {
          setError(e instanceof Error ? e.message : String(e))
          setPhase('error')
          return
        }
        if (run.status === 'failed') {
          const msg = (run.planning_error as string) || 'Falha no planejamento'
          setError(msg)
          setPhase('error')
          return
        }
      }

      const stepList = asStepList(run)
      setSteps(stepList)

      const activeStep = stepList.find((s) =>
        ['ready', 'running', 'waiting_approval'].includes(s.status ?? ''),
      )

      const uiSummary =
        (run.runtime_plan as { ui_summary?: WorkflowMeta['ui_summary'] } | undefined)?.ui_summary ?? {
          primary_skill_for_next_step: activeStep?.primary_skill ?? '',
          skills_used_to_build_current_material: [],
          current_stage_label: run.status as string,
        }

      const metaBase = {
        run_id:       run.run_id as string,
        template_id:  run.template_id as string,
        task_summary: (run.task_summary as string) ?? '',
        client_name:  run.client_name as string | undefined,
        ui_summary:   uiSummary,
        observations: (run.runtime_plan as { observations?: string } | undefined)?.observations ?? '',
        run_status:   run.status as string,
        planning_progress: null as string | null | undefined,
      }

      if (!activeStep || run.status === 'completed') {
        const lastDone = [...stepList].reverse().find((s) => s.artifacts?.length)
        const lastArtifact = lastDone?.artifacts?.[lastDone.artifacts.length - 1]
        setMeta({
          ...metaBase,
          current_step_id:    lastDone?.step_id ?? '',
          current_step_title: lastDone?.title ?? '',
          current_step_skill: lastDone?.primary_skill ?? '',
          gate_type:          null,
        })
        setOutput((lastArtifact as { content?: string } | undefined)?.content ?? '')
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

      if (activeStep.status === 'failed' || run.status === 'failed') {
        const msg =
          (activeStep as { error_message?: string }).error_message ||
          (run.planning_error as string) ||
          'Step falhou'
        setError(msg)
        setPhase('error')
        return
      }

      // ready or running → stream (usuário pode recarregar a página para tentar de novo)
      setPhase('streaming')
      _streamStep(run.run_id as string, activeStep.step_id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setPhase('error')
    }
  }

  async function approve(notes?: string) {
    if (!meta) return
    setPhase('streaming')
    setOutput('')
    try {
      const res = await api.approveStep(meta.run_id, meta.current_step_id, notes)

      setSteps((prev) => prev.map((s) =>
        s.step_id === meta.current_step_id ? { ...s, status: 'approved' } : s,
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setPhase('error')
    }
  }

  async function reject(feedback: string) {
    if (!meta) return
    try {
      await api.rejectStep(meta.run_id, meta.current_step_id, feedback)
      setSteps((prev) => prev.map((s) =>
        s.step_id === meta.current_step_id ? { ...s, status: 'rejected' } : s,
      ))
      setPhase('idle')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
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
      const run = (await api.getWorkflowRun(meta.run_id)) as Record<string, unknown>
      const rbSteps = asStepList(run)
      setSteps(rbSteps)
      const restartStep = rbSteps.find((s) => s.step_id === res.restarting_at)
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setPhase('error')
    }
  }

  return { phase, meta, output, error, steps, generate, resume, approve, reject, rebrief, reset }
}
