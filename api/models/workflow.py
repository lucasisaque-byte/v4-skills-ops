"""
Modelos de dados para o sistema de workflow stateful.

Três camadas:
  WorkflowTemplate  — definição estática (lida de JSON em disco, validada pela gramática)
  RuntimePlan       — plano executável produzido pelo Account Manager
  WorkflowRun       — estado de execução mantido pelo engine
"""
from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


# ─── Workflow Template (DSL estático) ─────────────────────────────────────────

class ApprovalGate(BaseModel):
    required: bool
    type: str  # "briefing" | "copy" | "hook" | "calendar" | "design" | "final" | "none"
    approve_action: str = ""
    reject_action: str = ""
    rebrief_action: str = ""


class RebriefPolicy(BaseModel):
    allowed: bool
    mode: Literal["rerun_step", "restart_from_step", "restart_entire_workflow"]
    target_step_id: Optional[str] = None
    invalidates: list[str] = []   # step_ids que voltam a pending quando este step é refeito


class QualityCheck(BaseModel):
    criterion: str
    description: str = ""


class WorkflowStepTemplate(BaseModel):
    id: str
    title: str
    goal: str = ""
    phase: str = ""
    primary_skill: str
    support_skills: list[str] = []
    input_artifacts: list[str] = []
    output_artifacts: list[str] = []
    approval_gate: Optional[ApprovalGate] = None
    rebrief_policy: Optional[RebriefPolicy] = None
    quality_checks: list[QualityCheck] = []


class WorkflowMetadata(BaseModel):
    deliverable_type: str
    category: str   # "aquisicao_performance" | "social_conteudo" | "marca_sistema_visual" | ...
    description: str
    owner: str = "account-manager"


class EntryRequirements(BaseModel):
    user_inputs: list[str] = []
    required_client_context: list[str] = []
    optional_client_context: list[str] = []
    fallbacks: list[dict] = []


class HandoffRule(BaseModel):
    from_step: str
    to_step: str
    rule: str
    mediator: str = "account-manager"


class CompletionRules(BaseModel):
    final_step_id: str
    final_artifact: str
    requires_all_gates: bool = True


class WorkflowTemplate(BaseModel):
    template_id: str
    version: str
    task_type: str
    display_name: str
    metadata: Optional[WorkflowMetadata] = None
    entry_requirements: Optional[EntryRequirements] = None
    phases: list[str] = []
    steps: list[WorkflowStepTemplate]
    handoff_rules: list[HandoffRule] = []
    completion_rules: Optional[CompletionRules] = None
    fallbacks: list[dict] = []


# ─── Runtime Plan (output do Account Manager) ─────────────────────────────────

class RequiredContextItem(BaseModel):
    source: str           # "dcc" | "ucm" | "brand.identity" | "brand.tokens"
    required: bool
    reason: str


class RuntimeStepBriefing(BaseModel):
    step_id: str
    briefing: str         # briefing detalhado que o AM prepara para a skill deste step


class UISummary(BaseModel):
    primary_skill_for_next_step: str
    skills_used_to_build_current_material: list[str]
    current_stage_label: str


class RuntimePlan(BaseModel):
    workflow_template_id: str
    workflow_version: str
    task_type: str
    task_summary: str
    selected_pipeline: list[str]          # [step_id, ...]
    required_context: list[RequiredContextItem]
    step_briefings: list[RuntimeStepBriefing]
    fallbacks: list[dict] = []
    ui_summary: UISummary
    observations: str = ""


# ─── Workflow Run (estado de execução) ────────────────────────────────────────

StepStatus = Literal[
    "pending", "ready", "running", "waiting_approval",
    "approved", "rejected", "rebrief_required",
    "completed", "failed", "skipped"
]

WorkflowStatus = Literal[
    "draft", "planning", "planned", "in_progress", "waiting_approval",
    "rebrief_required", "rejected", "completed", "failed"
]


class StepArtifact(BaseModel):
    name: str
    content: str
    version: int = 1
    created_at: str


class StepRun(BaseModel):
    step_id: str
    title: str
    primary_skill: str
    gate_type: Optional[str] = None   # "briefing" | "copy" | "hook" | "calendar" | "design" | "final"
    briefing: str = ""
    status: StepStatus = "pending"
    artifacts: list[StepArtifact] = []
    feedback: Optional[str] = None
    error_message: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class WorkflowRun(BaseModel):
    run_id: str
    client_id: str
    client_name: str
    template_id: str
    task_type: str
    llm_model: Optional[str] = None  # modelo efetivo deste run (persistido para steps/stream)
    task_input: dict = {}             # inputs originais do usuário
    task_summary: str
    status: WorkflowStatus = "draft"
    current_step_id: Optional[str] = None
    steps: list[StepRun] = []
    runtime_plan: Optional[RuntimePlan] = None
    planning_progress: Optional[str] = None
    planning_error: Optional[str] = None
    planning_started_at: Optional[str] = None
    planning_completed_at: Optional[str] = None
    planning_heartbeat_at: Optional[str] = None
    planning_attempt: int = 0
    planning_retry_note: Optional[str] = None
    created_at: str
    updated_at: str


# ─── Request / Response shapes ────────────────────────────────────────────────

class CreateWorkflowRunRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    client_id: str
    task_type: str
    input: dict = {}
    llm_model: Optional[str] = Field(default=None, alias="model")


class ApproveStepRequest(BaseModel):
    notes: Optional[str] = None


class RejectStepRequest(BaseModel):
    feedback: str


class RebriefRequest(BaseModel):
    feedback: str
    mode: Literal["rerun_step", "restart_from_step", "restart_entire_workflow"] = "rerun_step"
    target_step_id: Optional[str] = None
