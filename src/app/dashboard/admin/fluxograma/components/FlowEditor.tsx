'use client'

import React, { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  Play, 
  Download, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  Maximize,
  Settings,
  Trash2,
  Brain,
  Minimize,
  Expand,
  Grid3X3,
  Move
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import FlowCanvas from './FlowCanvas'
import { NodePalette } from './FluxoNodes'
import NodeConfigModal from './NodeConfigModal'
import FlowNodeComponent from './FlowNodeComponent'
import { FlowNode, FlowConnection, NodeConfigModalState } from './types'
import { NODE_TYPES, NodeType } from './FluxoNodes'

interface FlowEditorState {
  nodes: FlowNode[]
  connections: FlowConnection[]
  selectedNodeId: string | null
  selectedConnectionId: string | null
  isDragging: boolean
  dragOffset: { x: number, y: number }
  zoom: number
  pan: { x: number, y: number }
}

interface FlowEditorProps {
  flowId?: string
  initialNodes?: FlowNode[]
  initialConnections?: FlowConnection[]
  onSave?: (nodes: FlowNode[], connections: FlowConnection[]) => void
  onExecute?: (nodes: FlowNode[], connections: FlowConnection[]) => void
}

export default function FlowEditor({ 
  flowId, 
  initialNodes = [], 
  initialConnections = [], 
  onSave, 
  onExecute 
}: FlowEditorProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const [showNodeConfig, setShowNodeConfig] = useState<{
    nodeId: string
    nodeType: NodeType
    config: Record<string, any>
  } | null>(null)
  
  const [state, setState] = useState<FlowEditorState>({
    nodes: initialNodes,
    connections: initialConnections,
    selectedNodeId: null,
    selectedConnectionId: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    zoom: 1,
    pan: { x: 0, y: 0 }
  })

  const [isFullscreen, setIsFullscreen] = useState(false)

  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string, x: number, y: number } | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const [selectedConfig, setSelectedConfig] = useState<FlowNode | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)

  // Add new node to canvas
  const handleNodeAdd = useCallback((nodeType: NodeType) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const canvasRect = canvas.getBoundingClientRect()
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      position: {
        x: (canvasRect.width / 2) - 100 + Math.random() * 100,
        y: (canvasRect.height / 2) - 50 + Math.random() * 100
      },
      config: {}
    }

    setState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      selectedNodeId: newNode.id
    }))
  }, [])

  // Select node
  const handleNodeSelect = useCallback((nodeId: string) => {
    setState(prev => ({
      ...prev,
      selectedNodeId: nodeId,
      selectedConnectionId: null
    }))
  }, [])

  // Edit node configuration
  const handleConfigUpdate = useCallback((nodeId: string, config?: any) => {
    const node = state.nodes.find(n => n.id === nodeId)
    if (!node) return

    setShowNodeConfig({
      nodeId: node.id,
      nodeType: node.type as NodeType,
      config: node.config || {}
    })
  }, [state.nodes])

  // Delete node
  const handleNodeDelete = useCallback((nodeId: string) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(c => 
        c.from !== nodeId && c.to !== nodeId
      ),
      selectedNodeId: prev.selectedNodeId === nodeId ? null : prev.selectedNodeId
    }))
  }, [])

  // Handle node drag
  const handleNodeDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.preventDefault()
    const node = state.nodes.find(n => n.id === nodeId)
    if (!node) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    setState(prev => ({
      ...prev,
      isDragging: true,
      selectedNodeId: nodeId,
      dragOffset: {
        x: (e.clientX - rect.left) / state.zoom - node.position.x,
        y: (e.clientY - rect.top) / state.zoom - node.position.y
      }
    }))
  }, [state.nodes, state.zoom])

  const handleNodeDrag = useCallback((e: React.MouseEvent) => {
    if (!state.isDragging || !state.selectedNodeId) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const newX = (e.clientX - rect.left) / state.zoom - state.dragOffset.x
    const newY = (e.clientY - rect.top) / state.zoom - state.dragOffset.y

    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === state.selectedNodeId
          ? { ...node, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
          : node
      )
    }))
  }, [state.isDragging, state.selectedNodeId, state.dragOffset, state.zoom])

  const handleNodeDragEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    }))
  }, [])

  // Handle node connections
  const handleConnectionStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const node = state.nodes.find(n => n.id === nodeId)
    
    if (!canvasRect || !node) return
    
    const nodeWidth = 200
    const nodeHeight = 100
    
    setIsConnecting(true)
    setConnectionStart({
      nodeId,
      x: node.position.x + nodeWidth, // Align with output connection point center
      y: node.position.y + nodeHeight / 2
    })
    setMousePosition({
      x: (e.clientX - canvasRect.left) / state.zoom,
      y: (e.clientY - canvasRect.top) / state.zoom
    })
  }, [state.nodes, state.zoom])

  // Validate if connection is allowed based on node types
  const isValidConnection = useCallback((sourceNodeId: string, targetNodeId: string) => {
    const sourceNode = state.nodes.find(n => n.id === sourceNodeId)
    const targetNode = state.nodes.find(n => n.id === targetNodeId)
    
    if (!sourceNode || !targetNode) return false
    
    // Get node categories from NODE_TYPES
    const sourceCategory = NODE_TYPES[sourceNode.type]?.category
    const targetCategory = NODE_TYPES[targetNode.type]?.category
    
    // Validation rules:
    // 1. Triggers can connect to conditions or actions
    // 2. Conditions can connect to actions
    // 3. Actions can connect to other actions (for chaining)
    // 4. No backwards connections (action -> trigger, action -> condition)
    
    if (sourceCategory === 'trigger') {
      return targetCategory === 'condition' || targetCategory === 'action'
    }
    
    if (sourceCategory === 'condition') {
      return targetCategory === 'action'
    }
    
    if (sourceCategory === 'action') {
      return targetCategory === 'action' // Allow action chaining
    }
    
    return false
  }, [state.nodes])

  const handleConnectionEnd = useCallback((targetNodeId: string) => {
    if (!isConnecting || !connectionStart) return

    if (connectionStart.nodeId !== targetNodeId) {
      // Validate connection before creating
      const invalidConnection = !isValidConnection(connectionStart.nodeId, targetNodeId)
      
      if (invalidConnection) {
        console.warn('Conexão inválida')
      } else {
        // Check if connection already exists
        const connectionExists = state.connections.some(
          conn => conn.from === connectionStart.nodeId && conn.to === targetNodeId
        )
        
        if (!connectionExists) {
          const newConnection: FlowConnection = {
            id: `connection_${Date.now()}`,
            from: connectionStart.nodeId,
            to: targetNodeId
          }

          setState(prev => ({
            ...prev,
            connections: [...prev.connections, newConnection]
          }))
        }
      }
    }

    setIsConnecting(false)
    setConnectionStart(null)
  }, [isConnecting, connectionStart, isValidConnection, state.nodes, state.connections])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isConnecting) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      setMousePosition({
        x: (e.clientX - rect.left) / state.zoom,
        y: (e.clientY - rect.top) / state.zoom
      })
    } else if (state.isDragging) {
      handleNodeDrag(e)
    }
  }, [isConnecting, state.isDragging, state.zoom, handleNodeDrag])

  const handleCanvasMouseUp = useCallback(() => {
    if (isConnecting) {
      setIsConnecting(false)
      setConnectionStart(null)
    }
    if (state.isDragging) {
      handleNodeDragEnd()
    }
  }, [isConnecting, state.isDragging, handleNodeDragEnd])

  // Save node configuration
  const handleNodeConfigSave = useCallback((config: Record<string, any>) => {
    if (!showNodeConfig) return

    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === showNodeConfig.nodeId
          ? { ...node, config }
          : node
      )
    }))
    setShowNodeConfig(null)
  }, [showNodeConfig])

  // Save flow
  const handleSaveFlow = async () => {
    try {
      const flowData = {
        name: `Fluxo ${new Date().toLocaleDateString()}`,
        description: 'Fluxo de automação criado no editor',
        nodes: state.nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          config: node.config || {}
        })),
        connections: state.connections,
        isActive: true,
        createdAt: new Date().toISOString()
      }

      console.log('Saving flow:', flowData)
      
      // Call backend API to save flow
      const response = await fetch('/api/fluxos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData)
      })

      if (response.ok) {
        const savedFlow = await response.json()
        console.log('Flow saved successfully:', savedFlow)
        // Show success message
        alert('Fluxo salvo com sucesso!')
      } else {
        throw new Error('Failed to save flow')
      }
    } catch (error) {
      console.error('Error saving flow:', error)
      alert('Erro ao salvar fluxo. Tente novamente.')
    }
  }

  // Execute flow
  const handleExecute = useCallback(async () => {
    try {
      console.log('Executing flow:', state)
      
      if (state.nodes.length === 0) {
        alert('Adicione nodes ao fluxo antes de executar')
        return
      }

      // Find trigger nodes (start points)
      const triggerNodes = state.nodes.filter(node => 
        NODE_TYPES[node.type]?.category === 'trigger'
      )

      if (triggerNodes.length === 0) {
        alert('Adicione pelo menos um gatilho para executar o fluxo')
        return
      }

      const executionData = {
        flowId: `flow_${Date.now()}`,
        nodes: state.nodes,
        connections: state.connections,
        triggerNodes: triggerNodes.map(node => ({
          id: node.id,
          type: node.type,
          config: node.config || {}
        }))
      }

      // Call backend execution API
      const response = await fetch('/api/fluxos/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(executionData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Flow execution started:', result)
        alert('Fluxo iniciado com sucesso!')
      } else {
        throw new Error('Failed to execute flow')
      }
    } catch (error) {
      console.error('Error executing flow:', error)
      alert('Erro ao executar fluxo. Verifique a configuração.')
    }
  }, [state])

  // Handle export flow
  const handleExport = useCallback(() => {
    const flowData = JSON.stringify(state, null, 2)
    const blob = new Blob([flowData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fluxo_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [state])

  // Handle import flow
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const flowData = JSON.parse(event.target?.result as string)
            setState(flowData)
          } catch (error) {
            console.error('Erro ao importar fluxo:', error)
            alert('Erro ao importar arquivo. Verifique o formato.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }, [])

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.1, 2)
    }))
  }, [])

  const handleZoomOut = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.1, 0.5)
    }))
  }, [])

  const handleZoomReset = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom: 1,
      pan: { x: 0, y: 0 }
    }))
  }, [])

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} flex ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Node Palette */}
      <NodePalette onNodeSelect={handleNodeAdd} />

      {/* Main Editor Area */}
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center space-x-2">
          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveFlow}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </motion.button>

          {/* Execute Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExecute}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Executar</span>
          </motion.button>

          {/* AI Generate Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAiModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Brain className="w-4 h-4" />
            <span>Gerar com IA</span>
          </motion.button>

            {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </motion.button>

          {/* Import Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleImport}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importar</span>
          </motion.button>

          {/* Fullscreen Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={isFullscreen ? 'Sair do modo tela cheia' : 'Entrar em modo tela cheia'}
          >
            {isFullscreen ? <Minimize /> : <Expand />}
          </motion.button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors`}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleZoomReset}
              className={`px-3 py-2 text-sm font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} rounded-lg transition-colors`}
            >
              {Math.round(state.zoom * 100)}%
            </button>
            
            <button
              onClick={handleZoomIn}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors`}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* View Options */}
          <div className="flex items-center space-x-2">
            <button
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            
            <button
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className={`flex-1 relative overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
          style={{
            backgroundImage: isDark 
              ? 'radial-gradient(circle, #374151 1px, transparent 1px)'
              : 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        >
          {/* Canvas Content */}
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${state.zoom}) translate(${state.pan.x}px, ${state.pan.y}px)`,
              transformOrigin: '0 0'
            }}
          >
            {/* Render Nodes */}
            {state.nodes.map(node => (
              <FlowNodeComponent
                key={node.id}
                node={node}
                isSelected={state.selectedNodeId === node.id}
                isDark={isDark}
                onDragStart={handleNodeDragStart}
                onConfigOpen={(nodeId) => handleConfigUpdate(nodeId, {})}
                onConnectionStart={handleConnectionStart}
                onDelete={handleNodeDelete}
              />
            ))}

            {/* Render Connections */}
            <svg className="absolute inset-0 pointer-events-none w-full h-full">
              {/* Existing connections */}
              {state.connections.map(connection => {
                const fromNode = state.nodes.find(n => n.id === connection.from)
                const toNode = state.nodes.find(n => n.id === connection.to)
                
                if (!fromNode || !toNode) return null

                // Calculate connection points based on actual visual elements
                const nodeWidth = 200 // min-w-[200px] from FlowNode
                const nodeHeight = 100 // more accurate height estimate
                
                // Connection points should align with the visual circles
                // Output point (green circle on right): -right-3 (12px) + center (12px) = node + width
                const startX = fromNode.position.x + nodeWidth
                const startY = fromNode.position.y + nodeHeight / 2
                
                // Input point (blue circle on left): -left-3 (12px) + center (12px) = node position
                const endX = toNode.position.x
                const endY = toNode.position.y + nodeHeight / 2

                const midX = (startX + endX) / 2

                return (
                  <g key={connection.id}>
                    {/* Definir gradientes */}
                    <defs>
                      <linearGradient id={`gradient-${connection.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
                      </linearGradient>
                      <marker id={`arrowhead-${connection.id}`} markerWidth="10" markerHeight="7" 
                        refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" 
                          fill={isDark ? '#3B82F6' : '#2563EB'} />
                      </marker>
                    </defs>
                    
                    {/* Linha de fundo (sombra) */}
                    <path
                      d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                      stroke={isDark ? '#1F2937' : '#E5E7EB'}
                      strokeWidth="4"
                      fill="none"
                      opacity="0.3"
                    />
                    
                    {/* Linha principal com gradiente */}
                    <path
                      d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                      stroke={`url(#gradient-${connection.id})`}
                      strokeWidth="2"
                      fill="none"
                      markerEnd={`url(#arrowhead-${connection.id})`}
                      className="hover:stroke-opacity-100 cursor-pointer transition-all duration-200"
                      style={{ filter: 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.3))' }}
                    />
                    
                    {/* Ponto de origem */}
                    <circle
                      cx={startX}
                      cy={startY}
                      r="3"
                      fill="#10B981"
                      className="drop-shadow-sm"
                    />
                  </g>
                )
              })}
              
              {/* Active connection being drawn */}
              {isConnecting && connectionStart && (
                <g>
                  <defs>
                    <filter id="active-glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/> 
                      </feMerge>
                    </filter>
                    <linearGradient id="active-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#06D6A0" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                    <marker id="active-arrow" markerWidth="12" markerHeight="8" 
                      refX="10" refY="4" orient="auto">
                      <polygon points="0 0, 12 4, 0 8" 
                        fill="#3B82F6" />
                    </marker>
                  </defs>
                  
                  {/* Linha de fundo animada */}
                  <path
                    d={`M ${connectionStart.x} ${connectionStart.y} L ${mousePosition.x} ${mousePosition.y}`}
                    stroke="rgba(16, 185, 129, 0.2)"
                    strokeWidth="8"
                    fill="none"
                    className="animate-pulse"
                  />
                  
                  {/* Linha principal com gradiente animado */}
                  <path
                    d={`M ${connectionStart.x} ${connectionStart.y} L ${mousePosition.x} ${mousePosition.y}`}
                    stroke="url(#active-gradient)"
                    strokeWidth="3"
                    strokeDasharray="10,5"
                    fill="none"
                    markerEnd="url(#active-arrow)"
                    filter="url(#active-glow)"
                    className="animate-pulse"
                    style={{
                      animation: 'dash 1s linear infinite'
                    }}
                  />
                  
                  {/* Círculo de origem pulsante */}
                  <circle
                    cx={connectionStart.x}
                    cy={connectionStart.y}
                    r="6"
                    fill="#10B981"
                    className="animate-ping"
                    fillOpacity="0.6"
                  />
                  <circle
                    cx={connectionStart.x}
                    cy={connectionStart.y}
                    r="4"
                    fill="#10B981"
                  />
                  
                  {/* Target circle with pulse effect */}
                  <g className="animate-ping">
                    <circle
                      cx={mousePosition.x}
                      cy={mousePosition.y}
                      r="10"
                      fill="#3B82F6"
                      fillOpacity="0.4"
                    />
                  </g>
                  <circle
                    cx={mousePosition.x}
                    cy={mousePosition.y}
                    r="5"
                    fill="#10B981"
                    stroke="white"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>

            {/* Empty State */}
            {state.nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-center`}>
                    <Move className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Comece criando seu fluxo
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4 max-w-md`}>
                    Arraste componentes da paleta à esquerda para criar seu fluxo de automação
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className={`flex items-center justify-between p-3 border-t text-sm ${isDark ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-200 bg-white text-gray-600'}`}>
          <div className="flex items-center space-x-4">
            <span>{state.nodes.length} nós</span>
            <span>{state.connections.length} conexões</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {state.selectedNodeId && (
              <span>Nó selecionado: {NODE_TYPES[state.nodes.find(n => n.id === state.selectedNodeId)?.type || '']?.label || 'Desconhecido'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Node Configuration Modal */}
      {showNodeConfig && (
        <NodeConfigModal
          nodeId={showNodeConfig.nodeId}
          nodeType={showNodeConfig.nodeType}
          initialConfig={showNodeConfig.config}
          isOpen={true}
          onClose={() => setShowNodeConfig(null)}
          onSave={handleNodeConfigSave}
        />
      )}
    </div>
  )
}
