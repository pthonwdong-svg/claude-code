export interface Option<T = string> {
  label: string
  value: T
  description?: string
  disabled?: boolean
}
