export type ViewState = 'list' | 'detail' | 'install' | 'settings'

export interface PluginSettingsProps {
  pluginName: string
  settings: Record<string, any>
  onSave: (settings: Record<string, any>) => void
  [key: string]: any
}
