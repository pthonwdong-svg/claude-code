export interface SSHSession {
  host: string
  connected: boolean
  [key: string]: any
}

export async function createSSHSession(_host: string, _options?: any): Promise<SSHSession> {
  return { host: _host, connected: false }
}
