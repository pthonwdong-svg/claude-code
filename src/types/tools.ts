export interface BashProgress {
  command?: string
  output?: string
  [key: string]: any
}

export interface PowerShellProgress extends BashProgress {}
export interface ShellProgress extends BashProgress {}

export interface MCPProgress {
  serverName?: string
  toolName?: string
  [key: string]: any
}

export interface AgentToolProgress {
  agentName?: string
  [key: string]: any
}

export interface SkillToolProgress {
  skillName?: string
  [key: string]: any
}

export interface WebSearchProgress {
  query?: string
  [key: string]: any
}

export interface TaskOutputProgress {
  taskId?: string
  [key: string]: any
}

export interface SdkWorkflowProgress {
  workflowName?: string
  [key: string]: any
}
