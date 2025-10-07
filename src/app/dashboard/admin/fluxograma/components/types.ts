export interface FlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  config?: Record<string, any>
}

export interface FlowConnection {
  id: string
  from: string
  to: string
  sourceNodeId?: string // For backward compatibility  
  targetNodeId?: string // For backward compatibility
  sourcePortIndex?: number
}

export interface FlowState {
  nodes: FlowNode[]
  connections: FlowConnection[]
  zoom: number
  isDragging: boolean
  selectedNodeId: string | null
  dragOffset: { x: number; y: number }
}

export type NodeConfigModalState = {
  nodeId: string
  nodeType: string
  config: Record<string, any>
} | null
