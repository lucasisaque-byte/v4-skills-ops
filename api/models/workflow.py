"""
Modelos de dados para o sistema de workflow stateful.

Três camadas:
  WorkflowTemplate  — definição estática (lida de JSON em disco)
  RuntimePlan       — plano executável produzido pelo Account Manager
  WorkflowRun       — estado de execução mantido pelo engine
"""
from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field


# ─── Workflow Template (DSL estático) ─────────────────────────────────────────

class ApprovalGate(BaseModel):
    required: bool
    type: str  # "briefing" | "copy" | "design" | "output"


class RebriefPolicy(BaseModel):
    allowed: bool
    mode: Literal["rerun_step", "restart_from_step", "restart_entire_workflow"]
    target_step_id: Optional[str] = None


class WorkflowStepTemplate(BaseModel):
    id: str
    title: str
    primary_skill: str
    support_skills: list[str] = []
    input_artifacts: list[str] = []
    output_artifacts: list[str] = []
    approval_gate: Optional[ApprovalGate] = None
    rebrief_policy: Optional[RebriefPolicy] = None


class WorkflowTemplate(BaseModel):
    template_id: str
    version: str
    task_type: str
    display_name: str
    steps: list[WorkflowStepTemplate]
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
    "draft", "planned", "in_progress", "waiting_approval",
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
    briefing: str = ""
    status: StepStatus = "pending"
    artifacts: list[StepArtifact] = []
    feedback: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class WorkflowRun(BaseModel):
    run_id: str
    client_id: str
    client_name: str
    template_id: str
    task_type: str
    task_input: dict = {}             # inputs originais do usuário
    task_summary: str
    status: WorkflowStatus = "draft"
    current_step_id: Optional[str] = None
    steps: list[StepRun] = []
    runtime_plan: Optional[RuntimePlan] = None
    created_at: str
    updated_at: str


# ─── Request / Response shapes ────────────────────────────────────────────────

class CreateWorkflowRunRequest(BaseModel):
    client_id: str
    task_type: str           # "hooks" | "copy_lp" | "calendar" | "ads" | "reel_script" | "landing_page"
    input: dict = {}         # inputs livres (theme, platform, campaign_description, etc.)


class ApproveStepRequest(BaseModel):
    notes: Optional[str] = None


class RejectStepRequest(BaseModel):
    feedback: str


class RebriefRequest(BaseModel):
    feedback: str
    mode: Literal["rerun_step", "restart_from_step", "restart_entire_workflow"] = "rerun_step"
    target_step_id: Optional[str] = None
