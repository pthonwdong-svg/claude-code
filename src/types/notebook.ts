export type NotebookCellType = 'code' | 'markdown' | 'raw'

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
