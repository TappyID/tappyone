'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { FlowNode, FlowConnection } from './types'
import FlowNodeComponent, { getMenuOptionAnchorRatio, getNodeDimensions } from './FlowNodeComponent'
import ConnectionLine from './ConnectionLine'

interface FlowCanvasProps {
  nodes: FlowNode[]
  connections: FlowConnection[]
  zoom: number
  isDragging: boolean
  selectedNodeId: string | null
  isConnecting: boolean
  connectionStart: { nodeId: string; x: number; y: number; optionIndex?: number } | null
  mousePosition: { x: number; y: number }
  onNodeDragStart: (nodeId: string, e: React.MouseEvent) => void
  onNodeConfigOpen: (nodeId: string, nodeType: string) => void
  onConnectionStart: (nodeId: string, e: React.MouseEvent, portInfo?: { optionIndex?: number }) => void
  onConnectionEnd: (e: React.MouseEvent) => void
  onCanvasMouseMove: (e: React.MouseEvent) => void
  onCanvasMouseUp: () => void
  onNodeDelete: (nodeId: string) => void
}

export default function FlowCanvas({
  nodes,
  connections,
  zoom,
  isDragging,
  selectedNodeId,
  isConnecting,
  connectionStart,
  mousePosition,
  onNodeDragStart,
  onNodeConfigOpen,
  onConnectionStart,
  onConnectionEnd,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onNodeDelete
}: FlowCanvasProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={canvasRef}
      className={`flex-1 relative overflow-hidden ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={onCanvasMouseUp}
      onClick={onConnectionEnd}
    >
      {/* Canvas with zoom transform */}
      <motion.div
        className="w-full h-full relative"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
          minWidth: '2000px',
          minHeight: '2000px'
        }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0">
          <svg className="w-full h-full">
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke={isDark ? '#374151' : '#E5E7EB'}
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Connections */}
        {connections.map((connection) => {
          const fromNode = nodes.find(n => n.id === connection.from)
          const toNode = nodes.find(n => n.id === connection.to)
          
          if (!fromNode || !toNode) return null

          const fromMenuOptions = Array.isArray(fromNode.config?.listOptions) ? fromNode.config.listOptions : []
          const siblingConnections = connections.filter(c => c.from === fromNode.id)
          const menuPortCount = fromNode.type === 'action-whatsapp-list'
            ? Math.max(fromMenuOptions.length, siblingConnections.length || 0)
            : undefined
          const toMenuOptions = Array.isArray(toNode.config?.listOptions) ? toNode.config.listOptions : []
          const toSiblingConnections = connections.filter(c => c.from === toNode.id)
          const toMenuPortCount = toNode.type === 'action-whatsapp-list'
            ? Math.max(toMenuOptions.length, toSiblingConnections.length || 0)
            : undefined

          return (
            <ConnectionLine
              key={connection.id}
              from={{
                x: fromNode.position.x + getNodeDimensions(fromNode, menuPortCount).width,
                y: (() => {
                  const { height } = getNodeDimensions(fromNode, menuPortCount)
                  const derivedSourceIndex = (() => {
                    if (typeof connection.sourcePortIndex === 'number') {
                      return connection.sourcePortIndex
                    }
                    if (
                      fromNode.type === 'action-whatsapp-list' &&
                      toNode.config?.parentNodeId === fromNode.id &&
                      typeof toNode.config?.optionIndex === 'number'
                    ) {
                      return toNode.config.optionIndex
                    }
                    return undefined
                  })()

                  if (fromNode.type === 'action-whatsapp-list') {
                    const siblingsIndex = siblingConnections.findIndex(c => c.id === connection.id)
                    const fallbackIndex = siblingsIndex === -1 ? 0 : siblingsIndex
                    const effectiveIndex = typeof derivedSourceIndex === 'number' ? derivedSourceIndex : fallbackIndex
                    const ratio = getMenuOptionAnchorRatio(fromNode, effectiveIndex, menuPortCount)
                    return fromNode.position.y + height * ratio
                  }
                  return fromNode.position.y + height / 2
                })()
              }}
              to={{
                x: toNode.position.x,
                y: toNode.position.y + getNodeDimensions(toNode, toMenuPortCount).height / 2
              }}
              isDark={isDark}
            />
          )
        })}

        {/* Active connection line (while connecting) */}
        {isConnecting && connectionStart && (
          <ConnectionLine
            from={connectionStart}
            to={mousePosition}
            isDark={isDark}
            isActive
          />
        )}

        {/* Nodes */}
        {nodes.map((node) => {
          const outgoingConnections = connections.filter(conn => conn.from === node.id)
          const menuOptions = Array.isArray(node.config?.listOptions) ? node.config.listOptions : []
          const menuPortCount = node.type === 'action-whatsapp-list'
            ? Math.max(menuOptions.length, outgoingConnections.length || 0)
            : undefined

          return (
            <FlowNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isDark={isDark}
              onDragStart={onNodeDragStart}
              onConfigOpen={onNodeConfigOpen}
              onConnectionStart={onConnectionStart}
              onDelete={onNodeDelete}
              menuPortCount={menuPortCount}
            />
          )
        })}
      </motion.div>
    </div>
  )
}
