'use client'

import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Connection,
  ConnectionMode,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Maximize,
  Grid3X3,
  Eye,
  EyeOff
} from 'lucide-react'

import { Fluxograma, FluxogramaNode, FluxogramaEdge } from '../page'
import TriggerNode from './nodes/TriggerNode'
import ConditionNode from './nodes/ConditionNode'
import ActionNode from './nodes/ActionNode'
import KanbanNode from './nodes/KanbanNode'
import AtendenteNode from './nodes/AtendenteNode'
import RespostaNode from './nodes/RespostaNode'
import AgendamentoNode from './nodes/AgendamentoNode'
import IANode from './nodes/IANode'
import DelayNode from './nodes/DelayNode'

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  kanban: KanbanNode,
  atendente: AtendenteNode,
  resposta: RespostaNode,
  agendamento: AgendamentoNode,
  ia: IANode,
  delay: DelayNode
}

interface FluxogramaCanvasProps {
  fluxograma: Fluxograma | null
  onFluxogramaChange: (fluxograma: Fluxograma) => void
}

function FluxogramaCanvasInner({ fluxograma, onFluxogramaChange }: FluxogramaCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [showMiniMap, setShowMiniMap] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const { fitView, zoomIn, zoomOut } = useReactFlow()

  // Converter dados do fluxograma para formato do ReactFlow
  useEffect(() => {
    if (fluxograma) {
      const reactFlowNodes: Node[] = fluxograma.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        style: {
          background: node.data.color || '#ffffff',
          border: '2px solid #305e73',
          borderRadius: '12px',
          padding: '10px',
          minWidth: '150px',
          fontSize: '14px',
          fontWeight: '500'
        }
      }))

      const reactFlowEdges: Edge[] = fluxograma.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: edge.type || 'smoothstep',
        animated: edge.animated || false,
        style: {
          stroke: '#305e73',
          strokeWidth: 2
        },
        labelStyle: {
          fontSize: '12px',
          fontWeight: '500',
          fill: '#374151'
        }
      }))

      setNodes(reactFlowNodes)
      setEdges(reactFlowEdges)
    }
  }, [fluxograma, setNodes, setEdges])

  // Salvar mudanças no fluxograma
  const saveChanges = useCallback(() => {
    if (fluxograma) {
      const updatedNodes: FluxogramaNode[] = nodes.map(node => ({
        id: node.id,
        type: node.type as any,
        position: node.position,
        data: node.data
      }))

      const updatedEdges: FluxogramaEdge[] = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: edge.type,
        animated: edge.animated
      }))

      onFluxogramaChange({
        ...fluxograma,
        nodes: updatedNodes,
        edges: updatedEdges,
        updated_at: new Date().toISOString()
      })
    }
  }, [fluxograma, nodes, edges, onFluxogramaChange])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: '#305e73',
          strokeWidth: 2
        }
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = event.currentTarget.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')
      const nodeData = JSON.parse(event.dataTransfer.getData('application/nodedata'))

      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          ...nodeData,
          label: nodeData.label || `Novo ${type}`
        },
        style: {
          background: nodeData.color || '#ffffff',
          border: '2px solid #305e73',
          borderRadius: '12px',
          padding: '10px',
          minWidth: '150px',
          fontSize: '14px',
          fontWeight: '500'
        }
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes]
  )

  const exportFluxograma = () => {
    if (fluxograma) {
      const dataStr = JSON.stringify(fluxograma, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `${fluxograma.nome.replace(/\s+/g, '_')}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    }
  }

  if (!fluxograma) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Selecione um Fluxograma
          </h3>
          <p className="text-gray-600">
            Escolha um fluxograma existente ou crie um novo para começar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-gray-50"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#305e73', strokeWidth: 2 }
        }}
      >
        {/* Background */}
        <Background 
          color="#305e73" 
          gap={20} 
          size={1}
          variant="dots"
        />

        {/* Controls */}
        {showControls && (
          <Controls 
            className="bg-white border border-gray-200 rounded-lg shadow-lg"
            showZoom={false}
            showFitView={false}
            showInteractive={false}
          />
        )}

        {/* MiniMap */}
        {showMiniMap && (
          <MiniMap
            className="bg-white border border-gray-200 rounded-lg shadow-lg"
            nodeColor="#305e73"
            maskColor="rgba(48, 94, 115, 0.1)"
            position="bottom-left"
          />
        )}

        {/* Custom Controls Panel */}
        <Panel position="top-right" className="flex flex-col gap-2">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-2"
          >
            <div className="flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveChanges}
                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                title="Salvar Alterações"
              >
                <Save className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fitView()}
                className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                title="Ajustar Visualização"
              >
                <Maximize className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => zoomIn()}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => zoomOut()}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </motion.button>

              <hr className="border-gray-200" />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMiniMap(!showMiniMap)}
                className={`p-2 rounded-lg transition-colors ${
                  showMiniMap 
                    ? 'bg-[#305e73] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Toggle MiniMap"
              >
                {showMiniMap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowControls(!showControls)}
                className={`p-2 rounded-lg transition-colors ${
                  showControls 
                    ? 'bg-[#305e73] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Toggle Controls"
              >
                <Grid3X3 className="w-4 h-4" />
              </motion.button>

              <hr className="border-gray-200" />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportFluxograma}
                className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                title="Exportar Fluxograma"
              >
                <Download className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </Panel>

        {/* Status Panel */}
        <Panel position="bottom-right">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-3"
          >
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  fluxograma.status === 'ativo' ? 'bg-green-500 animate-pulse' : 
                  fluxograma.status === 'inativo' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="font-medium text-gray-700 capitalize">
                  {fluxograma.status}
                </span>
              </div>
              
              <div className="text-gray-600">
                {nodes.length} elementos
              </div>
              
              <div className="text-gray-600">
                {edges.length} conexões
              </div>
            </div>
          </motion.div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default function FluxogramaCanvas(props: FluxogramaCanvasProps) {
  return (
    <ReactFlowProvider>
      <FluxogramaCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
