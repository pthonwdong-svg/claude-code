#!/usr/bin/env bun
/**
 * Creates stub files for missing source files referenced by imports
 * but not present in the leaked source dump.
 *
 * Each stub exports the symbols that other files import from it,
 * using `any` types to satisfy the bundler.
 */
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { dirname, resolve } from 'path'

const root = resolve(import.meta.dir, '..')

interface StubDef {
  path: string
  content: string
}

const stubs: StubDef[] = [
  // ── src/types/message.ts (141 references — core message types) ──
  {
    path: 'src/types/message.ts',
    content: `import type { Anthropic } from '@anthropic-ai/sdk'

export type MessageOrigin = 'user' | 'assistant' | 'system' | 'tool'

export interface UserMessage {
  type: 'user'
  message: Anthropic.Messages.MessageParam
  [key: string]: any
}

export interface AssistantMessage {
  type: 'assistant'
  message: Anthropic.Messages.Message
  costUSD?: number
  durationMs?: number
  [key: string]: any
}

export interface SystemMessage {
  type: 'system'
  message: string
  [key: string]: any
}

export interface ProgressMessage {
  type: 'progress'
  tool_use_id: string
  content: any
  [key: string]: any
}

export interface HookResultMessage {
  type: 'hook_result'
  hookName: string
  result: any
  [key: string]: any
}

export interface AttachmentMessage {
  type: 'attachment'
  content: any
  [key: string]: any
}

export interface SystemAPIErrorMessage {
  type: 'system_api_error'
  error: any
  [key: string]: any
}

export interface SystemBridgeStatusMessage {
  type: 'system_bridge_status'
  status: string
  [key: string]: any
}

export interface SystemInformationalMessage {
  type: 'system_informational'
  message: string
  [key: string]: any
}

export interface SystemMemorySavedMessage {
  type: 'system_memory_saved'
  memory: string
  [key: string]: any
}

export interface SystemStopHookSummaryMessage {
  type: 'system_stop_hook_summary'
  summary: string
  [key: string]: any
}

export interface SystemThinkingMessage {
  type: 'system_thinking'
  thinking: string
  [key: string]: any
}

export interface SystemTurnDurationMessage {
  type: 'system_turn_duration'
  durationMs: number
  [key: string]: any
}

export interface CollapsedReadSearchGroup {
  type: 'collapsed_read_search_group'
  messages: Message[]
  [key: string]: any
}

export interface GroupedToolUseMessage {
  type: 'grouped_tool_use'
  messages: Message[]
  [key: string]: any
}

export type PartialCompactDirection = 'top' | 'bottom'

export type Message =
  | UserMessage
  | AssistantMessage
  | SystemMessage
  | ProgressMessage
  | HookResultMessage
  | AttachmentMessage
  | SystemAPIErrorMessage
  | SystemBridgeStatusMessage
  | SystemInformationalMessage
  | SystemMemorySavedMessage
  | SystemStopHookSummaryMessage
  | SystemThinkingMessage
  | SystemTurnDurationMessage
  | CollapsedReadSearchGroup
  | GroupedToolUseMessage

export type NormalizedUserMessage = UserMessage
export type NormalizedAssistantMessage = AssistantMessage
export type NormalizedMessage = Message

export type RenderableMessage = Message
`,
  },
  // ── src/types/tools.ts (17 references — tool progress types) ──
  {
    path: 'src/types/tools.ts',
    content: `export interface BashProgress {
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
`,
  },
  // ── src/types/connectorText.ts ──
  {
    path: 'src/types/connectorText.ts',
    content: `export interface ConnectorTextBlock {
  type: 'connector_text'
  text: string
  [key: string]: any
}

export function isConnectorTextBlock(block: any): block is ConnectorTextBlock {
  return block && block.type === 'connector_text'
}
`,
  },
  // ── src/types/utils.ts ──
  {
    path: 'src/types/utils.ts',
    content: `export type DeepImmutable<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepImmutable<R>>
  : T extends object
    ? { readonly [K in keyof T]: DeepImmutable<T[K]> }
    : T
`,
  },
  // ── src/types/fileSuggestion.ts ──
  {
    path: 'src/types/fileSuggestion.ts',
    content: `export interface FileSuggestionCommandInput {
  query?: string
  [key: string]: any
}
`,
  },
  // ── src/types/statusLine.ts ──
  {
    path: 'src/types/statusLine.ts',
    content: `export interface StatusLineCommandInput {
  text?: string
  [key: string]: any
}
`,
  },
  // ── src/types/notebook.ts ──
  {
    path: 'src/types/notebook.ts',
    content: `export type NotebookCellType = 'code' | 'markdown' | 'raw'

export interface NotebookCell {
  cell_type: NotebookCellType
  source: string[]
  outputs?: any[]
  metadata?: Record<string, any>
  [key: string]: any
}

export interface NotebookContent {
  cells: NotebookCell[]
  metadata?: Record<string, any>
  [key: string]: any
}
`,
  },
  // ── src/types/messageQueueTypes.ts ──
  {
    path: 'src/types/messageQueueTypes.ts',
    content: `export interface QueueOperationMessage {
  type: string
  payload?: any
  [key: string]: any
}
`,
  },
  // ── src/constants/querySource.ts (16 references) ──
  {
    path: 'src/constants/querySource.ts',
    content: `export type QuerySource =
  | 'repl'
  | 'cli'
  | 'bridge'
  | 'sdk'
  | 'remote'
  | 'resume'
  | 'assistant'
  | 'agent'
  | 'coordinator'
  | 'workflow'
  | 'proactive'
  | 'daemon'
  | 'trigger'
`,
  },
  // ── src/keybindings/types.ts (14 references) ──
  {
    path: 'src/keybindings/types.ts',
    content: `export interface ParsedKeystroke {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
}

export interface ParsedBinding {
  keystrokes: ParsedKeystroke[]
  action: KeybindingAction
}

export type KeybindingAction = string

export type KeybindingContextName = string

export interface KeybindingBlock {
  context?: KeybindingContextName
  bindings: ParsedBinding[]
}
`,
  },
  // ── src/components/agents/new-agent-creation/types.ts (13 references) ──
  {
    path: 'src/components/agents/new-agent-creation/types.ts',
    content: `export interface AgentWizardData {
  name?: string
  description?: string
  model?: string
  tools?: string[]
  instructions?: string
  [key: string]: any
}
`,
  },
  // ── src/components/mcp/types.ts (10 references) ──
  {
    path: 'src/components/mcp/types.ts',
    content: `export type MCPViewState = 'list' | 'detail' | 'add' | 'edit' | 'configure'

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
`,
  },
  // ── src/components/Spinner/types.ts (8 references) ──
  {
    path: 'src/components/Spinner/types.ts',
    content: `export interface RGBColor {
  r: number
  g: number
  b: number
}

export type SpinnerMode = 'default' | 'minimal' | 'dots' | 'line'
`,
  },
  // ── src/components/FeedbackSurvey/utils.ts (8 references) ──
  {
    path: 'src/components/FeedbackSurvey/utils.ts',
    content: `export type FeedbackSurveyType = 'nps' | 'satisfaction' | 'feature_request'

export interface FeedbackSurveyResponse {
  type: FeedbackSurveyType
  score?: number
  comment?: string
  timestamp: number
  [key: string]: any
}
`,
  },
  // ── src/utils/secureStorage/types.ts (6 references) ──
  {
    path: 'src/utils/secureStorage/types.ts',
    content: `export interface SecureStorageData {
  oauthToken?: string
  apiKey?: string
  [key: string]: any
}

export interface SecureStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
}
`,
  },
  // ── src/commands/plugin/types.ts (6 references) ──
  {
    path: 'src/commands/plugin/types.ts',
    content: `export type ViewState = 'list' | 'detail' | 'install' | 'settings'

export interface PluginSettingsProps {
  pluginName: string
  settings: Record<string, any>
  onSave: (settings: Record<string, any>) => void
  [key: string]: any
}
`,
  },
  // ── src/commands/install-github-app/types.ts (5 references) ──
  {
    path: 'src/commands/install-github-app/types.ts',
    content: `export type State = 'idle' | 'loading' | 'success' | 'error'

export interface Warning {
  message: string
  severity: 'low' | 'medium' | 'high'
}

export interface Workflow {
  name: string
  steps: string[]
  [key: string]: any
}
`,
  },
  // ── src/services/oauth/types.ts (4 references) ──
  {
    path: 'src/services/oauth/types.ts',
    content: `export interface OAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  tokenType?: string
  [key: string]: any
}

export type SubscriptionType = 'free' | 'pro' | 'team' | 'enterprise' | 'max'

export interface ReferralRedemptionsResponse {
  redemptions: any[]
  [key: string]: any
}

export interface ReferrerRewardInfo {
  rewardType: string
  amount: number
  [key: string]: any
}
`,
  },
  // ── src/services/lsp/types.ts (4 references) ──
  {
    path: 'src/services/lsp/types.ts',
    content: `export interface LspServerConfig {
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
`,
  },
  // ── src/cli/transports/Transport.ts (4 references) ──
  {
    path: 'src/cli/transports/Transport.ts',
    content: `export interface Transport {
  send(data: any): Promise<void>
  receive(): AsyncIterable<any>
  close(): Promise<void>
  [key: string]: any
}
`,
  },
  // ── src/components/wizard/types.ts (3 references) ──
  {
    path: 'src/components/wizard/types.ts',
    content: `import React from 'react'

export interface WizardContextValue {
  currentStep: number
  totalSteps: number
  next: () => void
  prev: () => void
  data: Record<string, any>
  setData: (data: Record<string, any>) => void
}

export interface WizardProviderProps {
  children: React.ReactNode
  steps: WizardStepComponent[]
  onComplete?: (data: Record<string, any>) => void
}

export type WizardStepComponent = React.ComponentType<{
  context: WizardContextValue
}>
`,
  },
  // ── src/entrypoints/sdk/controlTypes.ts (3 references) ──
  {
    path: 'src/entrypoints/sdk/controlTypes.ts',
    content: `export interface SDKControlPermissionRequest {
  tool: string
  input: any
  [key: string]: any
}

export interface SDKControlResponse {
  allowed: boolean
  reason?: string
  [key: string]: any
}
`,
  },
  // ── src/entrypoints/sdk/sdkUtilityTypes.ts (3 references) ──
  {
    path: 'src/entrypoints/sdk/sdkUtilityTypes.ts',
    content: `export interface NonNullableUsage {
  inputTokens: number
  outputTokens: number
  cacheReadInputTokens?: number
  cacheCreationInputTokens?: number
}
`,
  },
  // ── src/commands/plugin/unifiedTypes.ts (2 references) ──
  {
    path: 'src/commands/plugin/unifiedTypes.ts',
    content: `export interface UnifiedInstalledItem {
  name: string
  type: 'plugin' | 'skill' | 'mcp_server'
  version?: string
  scope?: string
  enabled: boolean
  [key: string]: any
}
`,
  },
  // ── src/services/tips/types.ts (2 references) ──
  {
    path: 'src/services/tips/types.ts',
    content: `export interface Tip {
  id: string
  title: string
  content: string
  category?: string
  [key: string]: any
}

export interface TipContext {
  sessionCount: number
  commandsUsed: string[]
  toolsUsed: string[]
  [key: string]: any
}
`,
  },
  // ── src/services/skillSearch/signals.ts (1 reference) ──
  {
    path: 'src/services/skillSearch/signals.ts',
    content: `export interface DiscoverySignal {
  type: string
  source: string
  confidence: number
  [key: string]: any
}
`,
  },
  // ── src/utils/filePersistence/types.ts (1 reference) ──
  {
    path: 'src/utils/filePersistence/types.ts',
    content: `export type TurnStartTime = number
`,
  },
  // ── src/query/transitions.ts (1 reference) ──
  {
    path: 'src/query/transitions.ts',
    content: `export type Continue = { type: 'continue'; [key: string]: any }
export type Terminal = { type: 'terminal'; [key: string]: any }
`,
  },
  // ── src/ink/cursor.ts (1 reference) ──
  {
    path: 'src/ink/cursor.ts',
    content: `export interface Cursor {
  x: number
  y: number
  visible: boolean
}
`,
  },
  // ── src/ink/events/paste-event.ts (1 reference) ──
  {
    path: 'src/ink/events/paste-event.ts',
    content: `export interface PasteEvent {
  text: string
}
`,
  },
  // ── src/ink/events/resize-event.ts (1 reference) ──
  {
    path: 'src/ink/events/resize-event.ts',
    content: `export interface ResizeEvent {
  columns: number
  rows: number
}
`,
  },
  // ── src/components/ui/option.ts (1 reference) ──
  {
    path: 'src/components/ui/option.ts',
    content: `export interface Option<T = string> {
  label: string
  value: T
  description?: string
  disabled?: boolean
}
`,
  },
  // ── src/assistant/sessionDiscovery.ts (1 reference) ──
  {
    path: 'src/assistant/sessionDiscovery.ts',
    content: `export interface AssistantSession {
  id: string
  name?: string
  createdAt: number
  [key: string]: any
}
`,
  },
  // ── src/ssh/SSHSessionManager.ts (1 reference) ──
  {
    path: 'src/ssh/SSHSessionManager.ts',
    content: `export class SSHSessionManager {
  constructor() {}
  async connect(_host: string, _options?: any): Promise<any> { return null }
  async disconnect(): Promise<void> {}
  isConnected(): boolean { return false }
}
`,
  },
  // ── src/ssh/createSSHSession.ts (1 reference) ──
  {
    path: 'src/ssh/createSSHSession.ts',
    content: `export interface SSHSession {
  host: string
  connected: boolean
  [key: string]: any
}

export async function createSSHSession(_host: string, _options?: any): Promise<SSHSession> {
  return { host: _host, connected: false }
}
`,
  },
  // ── src/tools/TungstenTool/TungstenTool.ts ──
  {
    path: 'src/tools/TungstenTool/TungstenTool.ts',
    content: `export const TungstenTool = {
  name: 'TungstenTool',
  description: 'Tungsten tool (stub)',
  async call(_input: any): Promise<any> { return { success: false, error: 'Not available' } },
}
`,
  },
  // ── src/tools/TungstenTool/TungstenLiveMonitor.ts ──
  {
    path: 'src/tools/TungstenTool/TungstenLiveMonitor.ts',
    content: `import React from 'react'

export const TungstenLiveMonitor: React.FC<any> = () => null
`,
  },
  // ── src/tools/WorkflowTool/constants.ts ──
  {
    path: 'src/tools/WorkflowTool/constants.ts',
    content: `export const WORKFLOW_TOOL_NAME = 'WorkflowTool'
`,
  },
  // ── src/tools/REPLTool/REPLTool.ts ──
  {
    path: 'src/tools/REPLTool/REPLTool.ts',
    content: `export const REPLTool = {
  name: 'REPLTool',
  description: 'REPL tool (stub)',
  async call(_input: any): Promise<any> { return { success: false, error: 'Not available' } },
}
`,
  },
  // ── src/tools/SuggestBackgroundPRTool/SuggestBackgroundPRTool.ts ──
  {
    path: 'src/tools/SuggestBackgroundPRTool/SuggestBackgroundPRTool.ts',
    content: `export const SuggestBackgroundPRTool = {
  name: 'SuggestBackgroundPRTool',
  description: 'Suggest Background PR tool (stub)',
  async call(_input: any): Promise<any> { return { success: false, error: 'Not available' } },
}
`,
  },
  // ── src/tools/VerifyPlanExecutionTool/VerifyPlanExecutionTool.ts ──
  {
    path: 'src/tools/VerifyPlanExecutionTool/VerifyPlanExecutionTool.ts',
    content: `export const VerifyPlanExecutionTool = {
  name: 'VerifyPlanExecutionTool',
  description: 'Verify Plan Execution tool (stub)',
  async call(_input: any): Promise<any> { return { success: false, error: 'Not available' } },
}
`,
  },
  // ── src/tasks/LocalWorkflowTask/LocalWorkflowTask.ts (1 reference) ──
  {
    path: 'src/tasks/LocalWorkflowTask/LocalWorkflowTask.ts',
    content: `export type LocalWorkflowTaskState = 'idle' | 'running' | 'completed' | 'failed'
`,
  },
  // ── src/tasks/MonitorMcpTask/MonitorMcpTask.ts (1 reference) ──
  {
    path: 'src/tasks/MonitorMcpTask/MonitorMcpTask.ts',
    content: `export type MonitorMcpTaskState = 'idle' | 'monitoring' | 'stopped' | 'error'
`,
  },
  // ── src/components/agents/SnapshotUpdateDialog.ts (1 reference) ──
  {
    path: 'src/components/agents/SnapshotUpdateDialog.tsx',
    content: `import React from 'react'

export const SnapshotUpdateDialog: React.FC<any> = () => null
`,
  },
  // ── src/commands/agents-platform/index.ts ──
  {
    path: 'src/commands/agents-platform/index.ts',
    content: `export default {}
`,
  },
  // ── src/commands/assistant/assistant.ts ──
  {
    path: 'src/commands/assistant/assistant.ts',
    content: `export async function launchAssistant(_options?: any): Promise<void> {}
`,
  },
  // ── src/assistant/AssistantSessionChooser.tsx ──
  {
    path: 'src/assistant/AssistantSessionChooser.tsx',
    content: `import React from 'react'

export const AssistantSessionChooser: React.FC<any> = () => null
`,
  },
  // ── src/utils/envUtils protectedNamespace ──
  {
    path: 'src/utils/protectedNamespace.ts',
    content: `export const protectedNamespaces: string[] = []
export function isProtectedNamespace(_ns: string): boolean { return false }
`,
  },
  // ── src/entrypoints/sdk/coreTypes.generated.ts ──
  {
    path: 'src/entrypoints/sdk/coreTypes.generated.ts',
    content: `export {}
`,
  },
  // ── src/entrypoints/sdk/runtimeTypes.ts ──
  {
    path: 'src/entrypoints/sdk/runtimeTypes.ts',
    content: `export {}
`,
  },
  // ── src/entrypoints/sdk/toolTypes.ts ──
  {
    path: 'src/entrypoints/sdk/toolTypes.ts',
    content: `export {}
`,
  },
  // ── src/entrypoints/sdk/settingsTypes.generated.ts ──
  {
    path: 'src/entrypoints/sdk/settingsTypes.generated.ts',
    content: `export interface Settings {
  [key: string]: any
}
`,
  },
  // ── src/services/compact/snipCompact.ts ──
  {
    path: 'src/services/compact/snipCompact.ts',
    content: `export async function snipCompact(_messages: any[], _options?: any): Promise<any[]> {
  return _messages
}
`,
  },
  // ── src/services/compact/cachedMicrocompact.ts ──
  {
    path: 'src/services/compact/cachedMicrocompact.ts',
    content: `export async function cachedMicrocompact(_messages: any[], _options?: any): Promise<any[]> {
  return _messages
}
`,
  },
  // ── src/utils/permissions/devtools.ts ──
  {
    path: 'src/utils/permissions/devtools.ts',
    content: `export function enableDevtools(): void {}
export function isDevtoolsEnabled(): boolean { return false }
`,
  },
  // ── global.d.ts referenced from some files ──
  {
    path: 'src/global.d.ts',
    content: `/// <reference types="bun-types" />

declare const MACRO: {
  VERSION: string
  BUILD_TIME: string
  PACKAGE_URL: string
  NATIVE_PACKAGE_URL: string
  ISSUES_EXPLAINER: string
  FEEDBACK_CHANNEL: string
  VERSION_CHANGELOG: string
}
`,
  },
  // ── skill verify files referenced as text ──
  {
    path: 'src/skills/verify/SKILL.md',
    content: `# Verification Skill
Stub file for missing skill definition.
`,
  },
  {
    path: 'src/skills/verify/examples/cli.md',
    content: `# CLI Verification Example
Stub file.
`,
  },
  {
    path: 'src/skills/verify/examples/server.md',
    content: `# Server Verification Example
Stub file.
`,
  },
]

let created = 0
let skipped = 0

for (const stub of stubs) {
  const fullPath = resolve(root, stub.path)
  if (existsSync(fullPath)) {
    skipped++
    continue
  }
  mkdirSync(dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, stub.content, 'utf-8')
  created++
  console.log(`  Created: ${stub.path}`)
}

console.log(`\nDone: ${created} files created, ${skipped} skipped (already exist)`)
