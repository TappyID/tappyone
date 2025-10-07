'use client'

import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { FlowNode, FlowConnection } from './types'
import { NODE_TYPES } from './FluxoNodes'
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

          return (
            <ConnectionLine
              key={connection.id}
              from={{
                x: fromNode.position.x + getNodeDimensions(fromNode).width,
                y: (() => {
                  const { height } = getNodeDimensions(fromNode)
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

                  if (fromNode.type === 'action-whatsapp-list' && typeof derivedSourceIndex === 'number') {
                    const ratio = getMenuOptionAnchorRatio(fromNode, derivedSourceIndex)
                    return fromNode.position.y + height * ratio
                  }
                  return fromNode.position.y + height / 2
                })()
              }}
              to={{
                x: toNode.position.x,
                y: toNode.position.y + getNodeDimensions(toNode).height / 2
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
        {nodes.map((node) => (
          <FlowNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isDark={isDark}
            onDragStart={onNodeDragStart}
            onConfigOpen={onNodeConfigOpen}
            onConnectionStart={onConnectionStart}
            onDelete={onNodeDelete}
          />
        ))}
      </motion.div>
    </div>
  )
}
