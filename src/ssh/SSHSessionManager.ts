export class SSHSessionManager {
  constructor() {}
  async connect(_host: string, _options?: any): Promise<any> { return null }
  async disconnect(): Promise<void> {}
  isConnected(): boolean { return false }
}
