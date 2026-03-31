export type MCPViewState = 'list' | 'detail' | 'add' | 'edit' | 'configure'

export interface ServerInfo {
  name: string
  type: string
  status?: string
  [key: string]: any
}

export interface StdioServerInfo extends ServerInfo {
  type: 'stdio'
  command: string
  args?: string[]
}

export interface SSEServerInfo extends ServerInfo {
  type: 'sse'
  url: string
}

export interface HTTPServerInfo extends ServerInfo {
  type: 'http'
  url: string
}

export interface ClaudeAIServerInfo extends ServerInfo {
  type: 'claude_ai'
}

export interface AgentMcpServerInfo extends ServerInfo {
  type: 'agent'
}
