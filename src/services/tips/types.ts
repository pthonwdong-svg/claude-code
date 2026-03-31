export interface Tip {
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
