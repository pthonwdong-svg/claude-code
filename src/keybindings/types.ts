export interface ParsedKeystroke {
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
