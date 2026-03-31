import type { Anthropic } from '@anthropic-ai/sdk'

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
