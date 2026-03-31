export interface UnifiedInstalledItem {
  name: string
  type: 'plugin' | 'skill' | 'mcp_server'
  version?: string
  scope?: string
  enabled: boolean
  [key: string]: any
}
