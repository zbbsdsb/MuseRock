export interface Checkpoint {
    id: string;
    at: string;
    summary: string;
    decision?: string;
    evidence?: string[];
    next_action?: string;
    [key: string]: unknown;
}
export interface Identity {
    agent_name: string;
    agent_id?: string;
    project_name: string;
    organization?: string;
    environment?: string;
    [key: string]: unknown;
}
export interface Role {
    name?: string;
    responsibilities?: string[];
    boundaries?: string[];
    [key: string]: unknown;
}
export interface Goal {
    primary?: string;
    secondary?: string[];
    [key: string]: unknown;
}
export interface CurrentState {
    stage?: string;
    task?: string;
    status: string;
    last_checkpoint?: string;
    next_action?: string;
    [key: string]: unknown;
}
export interface Progress {
    completed?: string[];
    blocked_by?: string[];
    open_questions?: string[];
    [key: string]: unknown;
}
export interface AgentRelation {
    from: string;
    to: string;
    type: string;
    [key: string]: unknown;
}
export interface Relations {
    related_agents?: string[];
    related_projects?: string[];
    related_files?: string[];
    related_tools?: string[];
    agent_graph?: AgentRelation[];
    [key: string]: unknown;
}
export interface Rules {
    should?: string[];
    should_not?: string[];
    [key: string]: unknown;
}
export interface StatuzDocument {
    statuz_version: "0.1";
    updated_at?: string;
    identity: Identity;
    role?: Role;
    goal?: Goal;
    current_state: CurrentState;
    progress?: Progress;
    relations?: Relations;
    rules?: Rules;
    checkpoints?: Checkpoint[];
    [key: string]: unknown;
}
export interface ValidationResult {
    valid: boolean;
    errors?: Array<{
        path: string;
        message: string;
    }>;
}
export type StatusValue = "idle" | "in_progress" | "blocked" | "waiting_for_user" | "waiting_for_tool" | "completed" | "paused" | "failed" | string;
export type StageValue = "planning" | "implementation" | "testing" | "review" | "release" | "prime" | "drafting" | "reflection" | "revision" | "scoping" | "searching" | "reading" | "synthesizing" | "writing" | "triage" | "investigation" | "resolution" | "followup" | string;
