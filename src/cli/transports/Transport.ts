export interface Transport {
  send(data: any): Promise<void>
  receive(): AsyncIterable<any>
  close(): Promise<void>
  [key: string]: any
}
