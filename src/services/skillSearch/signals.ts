export interface DiscoverySignal {
  type: string
  source: string
  confidence: number
  [key: string]: any
}
