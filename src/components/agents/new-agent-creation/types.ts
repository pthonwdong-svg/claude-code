export interface AgentWizardData {
  name?: string
  description?: string
  model?: string
  tools?: string[]
  instructions?: string
  [key: string]: any
}
