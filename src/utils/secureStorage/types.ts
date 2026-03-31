export interface SecureStorageData {
  oauthToken?: string
  apiKey?: string
  [key: string]: any
}

export interface SecureStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
}
