export interface SDKControlPermissionRequest {
  tool: string
  input: any
  [key: string]: any
}

export interface SDKControlResponse {
  allowed: boolean
  reason?: string
  [key: string]: any
}
