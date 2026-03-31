export interface ConnectorTextBlock {
  type: 'connector_text'
  text: string
  [key: string]: any
}

export function isConnectorTextBlock(block: any): block is ConnectorTextBlock {
  return block && block.type === 'connector_text'
}
