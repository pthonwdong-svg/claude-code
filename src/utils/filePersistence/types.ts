export type TurnStartTime = number

export const DEFAULT_UPLOAD_CONCURRENCY = 5
export const FILE_COUNT_LIMIT = 500
export const OUTPUTS_SUBDIR = 'outputs'

export interface PersistedFile {
  path: string
  fileId?: string
  [key: string]: any
}

export interface FailedPersistence {
  path: string
  error: string
  [key: string]: any
}

export interface FilesPersistedEventData {
  count: number
  failedCount: number
  files: PersistedFile[]
  failed: FailedPersistence[]
  [key: string]: any
}
