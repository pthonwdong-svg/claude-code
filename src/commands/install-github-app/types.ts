export type State = 'idle' | 'loading' | 'success' | 'error'

export interface Warning {
  message: string
  severity: 'low' | 'medium' | 'high'
}

export interface Workflow {
  name: string
  steps: string[]
  [key: string]: any
}
