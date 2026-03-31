export interface LspServerConfig {
  name: string
  command: string
  args?: string[]
  rootUri?: string
  languageId?: string
  [key: string]: any
}

export type LspServerState = 'starting' | 'running' | 'stopped' | 'error'

export interface ScopedLspServerConfig {
  scope: string
  config: LspServerConfig
}
