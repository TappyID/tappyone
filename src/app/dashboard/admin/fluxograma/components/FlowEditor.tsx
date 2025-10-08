'use client'

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
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
import { useAuth } from '@/hooks/useAuth'
import FlowNodeComponent, { getMenuOptionAnchorRatio, getNodeDimensions } from './FlowNodeComponent'
import NodeConfigModal from './NodeConfigModal'
import NodePalette from './NodePalette'
import AiGenerateModal from './AiGenerateModal'
import { NODE_TYPES, NodeType } from './FluxoNodes'

// Types
interface FlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  config?: Record<string, any>
}

interface FlowConnection {
  id: string
  from: string
  to: string
}

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
  const { token } = useAuth()
  const [availableQuadros, setAvailableQuadros] = useState<any[]>([])
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
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string, x: number, y: number, optionIndex?: number } | null>(null)
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
  const handleConfigEdit = useCallback((nodeId: string, config?: any) => {
    const node = state.nodes.find(n => n.id === nodeId)
    if (!node) return

    setShowNodeConfig({
      nodeId: node.id,
      nodeType: node.type as NodeType,
      config: node.config || {}
    })
  }, [state.nodes])

  // Delete node
  const handleNodeDelete = useCallback(async (nodeId: string) => {
    // Se estamos editando um fluxo existente, deletar no backend também
    if (flowId && token) {
      try {
        console.log('Deletando nó do backend:', nodeId)
        const response = await fetch(`/api/fluxos/${flowId}/nodes/${nodeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          console.error('Erro ao deletar nó do backend:', response.status)
          // Continua deletando do frontend mesmo se der erro no backend
        } else {
          console.log('Nó deletado do backend com sucesso')
        }
      } catch (error) {
        console.error('Erro ao deletar nó do backend:', error)
        // Continua deletando do frontend mesmo se der erro
      }
    }

    // Deletar do estado local (frontend)
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(c => 
        c.from !== nodeId && c.to !== nodeId
      ),
      selectedNodeId: prev.selectedNodeId === nodeId ? null : prev.selectedNodeId
    }))
  }, [flowId, token])

  // Clear all nodes
  const handleClearAll = useCallback(async () => {
    if (!confirm('Tem certeza que deseja apagar todos os nós? Esta ação não pode ser desfeita.')) {
      return
    }

    // Se estamos editando um fluxo existente, deletar todos os nós no backend
    if (flowId && token) {
      try {
        console.log('Apagando todos os nós do backend do fluxo:', flowId)
        
        // Usar o endpoint de salvamento com array vazio para deletar todos
        const response = await fetch(`/api/fluxos/${flowId}/nodes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nodes: [] }) // Array vazio para deletar tudo
        })

        if (!response.ok) {
          console.error('Erro ao apagar nós do backend:', response.status)
          alert('Erro ao apagar nós do backend')
          return
        } else {
          console.log('Todos os nós deletados do backend com sucesso')
        }
      } catch (error) {
        console.error('Erro ao apagar nós do backend:', error)
        alert('Erro ao apagar nós: ' + error.message)
        return
      }
    }

    // Limpar estado local (frontend)
    setState(prev => ({
      ...prev,
      nodes: [],
      connections: [],
      selectedNodeId: null
    }))

    console.log('Todos os nós foram apagados')
  }, [flowId, token])

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
  }, [state.nodes, state.zoom, state.connections])

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
  const handleConnectionStart = useCallback((nodeId: string, e: React.MouseEvent, portInfo?: { optionIndex?: number }) => {
    e.stopPropagation()
    
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const node = state.nodes.find(n => n.id === nodeId)
    
    if (!canvasRect || !node) return
    
    const menuOptions = Array.isArray(node.config?.listOptions) ? node.config.listOptions : []
    const existingConnections = state.connections.filter(conn => conn.from === node.id)
    const menuPortCount = node.type === 'action-whatsapp-list'
      ? Math.max(menuOptions.length, existingConnections.length || 0)
      : undefined
    const { width, height } = getNodeDimensions(node, menuPortCount)
    const optionIndex = typeof portInfo?.optionIndex === 'number' ? portInfo.optionIndex : undefined
    let anchorY = node.position.y + height / 2

    if (node.type === 'action-whatsapp-list' && typeof optionIndex === 'number') {
      const ratio = getMenuOptionAnchorRatio(node, optionIndex, menuPortCount)
      anchorY = node.position.y + height * ratio
    }

    setIsConnecting(true)
    setConnectionStart({
      nodeId,
      x: node.position.x + width,
      y: anchorY,
      optionIndex
    })
    setMousePosition({
      x: (e.clientX - canvasRect.left) / state.zoom,
      y: (e.clientY - canvasRect.top) / state.zoom
    })
  }, [state.nodes, state.zoom, state.connections])

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
            to: targetNodeId,
            sourcePortIndex: connectionStart.optionIndex
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

  // Handle node configuration
  const handleNodeConfig = (node: FlowNode) => {
    setSelectedConfig(node)
    setShowConfigModal(true)
  }

  // Handle AI generation
  const handleAiGenerate = async (type: 'template' | 'prompt', data: any) => {
    console.log('🤖 Gerando fluxo com IA:', type, data)
    
    try {
      if (type === 'template') {
        // Generate from template
        const templateFlows = generateTemplateFlow(data.templateId)
        setState(prev => ({
          ...prev,
          nodes: templateFlows.nodes,
          connections: templateFlows.connections
        }))
      } else {
        // Generate from prompt - call AI API
        const response = await fetch('/api/ai/generate-flow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: data.prompt })
        })
        
        if (response.ok) {
          const aiFlow = await response.json()
          setState(prev => ({
            ...prev,
            nodes: aiFlow.nodes,
            connections: aiFlow.connections
          }))
        }
      }
      
      // Close AI modal after successful generation
      setShowAiModal(false)
    } catch (error) {
      console.error('❌ Erro ao gerar fluxo:', error)
      alert('Erro ao gerar fluxo. Tente novamente.')
    }
  }

  // Generate predefined template flows
  const generateTemplateFlow = (templateId: string) => {
    const baseFlow = {
      nodes: [] as FlowNode[],
      connections: [] as any[]
    }

    switch (templateId) {
      case 'atendimento-basico':
        return {
          nodes: [
            { id: '1', type: 'trigger-whatsapp-message', position: { x: 150, y: 50 }, config: {} },
            { id: '2', type: 'action-whatsapp-text', position: { x: 150, y: 200 }, config: { message: 'Olá! Bem-vindo ao nosso atendimento! 👋' } },
            { id: '3', type: 'action-whatsapp-list', position: { x: 150, y: 350 }, config: { title: 'Como posso ajudar?', menuOptions: [
              { id: '1', title: 'Suporte', description: 'Preciso de ajuda' },
              { id: '2', title: 'Vendas', description: 'Quero comprar' },
              { id: '3', title: 'Falar com humano', description: 'Atendimento pessoal' }
            ]}},
            { id: '4', type: 'action-fila-assign', position: { x: 150, y: 500 }, config: { filaId: 'suporte' } },
            { id: '5', type: 'end-success', position: { x: 150, y: 650 }, config: {} }
          ],
          connections: [
            { id: 'conn1', from: '1', to: '2' },
            { id: 'conn2', from: '2', to: '3' },
            { id: 'conn3', from: '3', to: '4' },
            { id: 'conn4', from: '4', to: '5' }
          ]
        }
      
      case 'vendas-completo':
        return {
          nodes: [
            // Trigger inicial
            { id: '1', type: 'trigger-whatsapp-message', position: { x: 150, y: 50 }, config: {} },
            // Mensagem de boas-vindas
            { id: '2', type: 'action-whatsapp-text', position: { x: 150, y: 200 }, config: { message: '🎉 Olá! Que bom te ver aqui! Como posso ajudar com seus projetos?' } },
            // Condição para detectar interesse em orçamento
            { id: '3', type: 'condition-text-contains', position: { x: 150, y: 350 }, config: { searchText: 'orçamento,preço,valor' } },
            
            // Caminho SIM da condição (interessado em orçamento)
            { id: '4', type: 'action-whatsapp-media', position: { x: 450, y: 500 }, config: { mediaType: 'image', caption: 'Aqui está nosso catálogo! 📋' } },
            { id: '5', type: 'action-contact-create', position: { x: 450, y: 650 }, config: {} },
            { id: '6', type: 'action-kanban-create', position: { x: 450, y: 800 }, config: {} },
            { id: '7', type: 'end-success', position: { x: 450, y: 950 }, config: { message: 'Lead qualificado criado!' } },
            
            // Caminho NÃO da condição (não mencionou orçamento)
            { id: '8', type: 'action-whatsapp-text', position: { x: -150, y: 500 }, config: { message: 'Entendi! Vou direcionar você para nosso atendimento. Em que posso ajudar?' } },
            { id: '9', type: 'action-fila-assign', position: { x: -150, y: 650 }, config: { filaId: 'atendimento-geral' } },
            { id: '10', type: 'end-success', position: { x: -150, y: 800 }, config: { message: 'Direcionado para atendimento' } }
          ],
          connections: [
            { id: 'conn1', from: '1', to: '2' },
            { id: 'conn2', from: '2', to: '3' },
            // Caminho SIM (interessado em orçamento)
            { id: 'conn3', from: '3', to: '4' },
            { id: 'conn4', from: '4', to: '5' },
            { id: 'conn5', from: '5', to: '6' },
            { id: 'conn6', from: '6', to: '7' },
            // Caminho NÃO (não mencionou orçamento)
            { id: 'conn7', from: '3', to: '8' },
            { id: 'conn8', from: '8', to: '9' },
            { id: 'conn9', from: '9', to: '10' }
          ]
        }

      case 'suporte-tecnico':
        return {
          nodes: [
            // Trigger inicial
            { id: '1', type: 'trigger-whatsapp-message', position: { x: 150, y: 50 }, config: {} },
            // Mensagem de boas-vindas
            { id: '2', type: 'action-whatsapp-text', position: { x: 150, y: 200 }, config: { message: '🔧 Olá! Bem-vindo ao suporte técnico. Vamos resolver seu problema!' } },
            // Menu de opções
            { id: '3', type: 'action-whatsapp-list', position: { x: 150, y: 350 }, config: { 
              title: 'Selecione seu problema:', 
              menuOptions: [
                { id: '1', title: 'Erro no Sistema', description: 'Sistema apresentando erro' },
                { id: '2', title: 'Dúvida sobre Funcionalidade', description: 'Como usar alguma função' },
                { id: '3', title: 'Outro Problema', description: 'Problema não listado' }
              ]
            }},
            
            // Caminho para erros no sistema
            { id: '4', type: 'action-whatsapp-text', position: { x: 450, y: 500 }, config: { message: 'Entendi que há um erro no sistema. Vou coletar algumas informações...' } },
            { id: '5', type: 'action-contact-add-tag', position: { x: 450, y: 650 }, config: { tag: 'erro-sistema' } },
            { id: '6', type: 'action-fila-assign', position: { x: 450, y: 800 }, config: { filaId: 'suporte-nivel2' } },
            
            // Caminho para dúvidas
            { id: '7', type: 'action-whatsapp-text', position: { x: -150, y: 500 }, config: { message: 'Perfeito! Vou te ajudar com sua dúvida. Qual funcionalidade?' } },
            { id: '8', type: 'action-contact-add-tag', position: { x: -150, y: 650 }, config: { tag: 'duvida-funcionalidade' } },
            { id: '9', type: 'action-fila-assign', position: { x: -150, y: 800 }, config: { filaId: 'suporte-nivel1' } },
            
            // Caminho outros problemas
            { id: '10', type: 'action-whatsapp-text', position: { x: 150, y: 650 }, config: { message: 'Sem problemas! Descreva sua situação que vamos resolver.' } },
            { id: '11', type: 'action-fila-assign', position: { x: 150, y: 800 }, config: { filaId: 'suporte-geral' } },
            
            // Finalizações
            { id: '12', type: 'end-success', position: { x: 450, y: 950 }, config: {} },
            { id: '13', type: 'end-success', position: { x: -150, y: 950 }, config: {} },
            { id: '14', type: 'end-success', position: { x: 150, y: 950 }, config: {} }
          ],
          connections: [
            { id: 'conn1', from: '1', to: '2' },
            { id: 'conn2', from: '2', to: '3' },
            // Caminho erro sistema
            { id: 'conn3', from: '3', to: '4' },
            { id: 'conn4', from: '4', to: '5' },
            { id: 'conn5', from: '5', to: '6' },
            { id: 'conn6', from: '6', to: '12' },
            // Caminho dúvidas
            { id: 'conn7', from: '3', to: '7' },
            { id: 'conn8', from: '7', to: '8' },
            { id: 'conn9', from: '8', to: '9' },
            { id: 'conn10', from: '9', to: '13' },
            // Caminho outros
            { id: 'conn11', from: '3', to: '10' },
            { id: 'conn12', from: '10', to: '11' },
            { id: 'conn13', from: '11', to: '14' }
          ]
        }

      default:
        return baseFlow
    }
  }

  // Handle node configuration save - criar mini-nodes automaticamente
  const handleConfigUpdate = useCallback((nodeId: string, config: Record<string, any>) => {
    const node = state.nodes.find(n => n.id === nodeId)
    if (!node) return

    // Remover nodes filhos existentes primeiro
    const childNodeIds = state.nodes
      .filter(n => n.config?.parentNodeId === nodeId)
      .map(n => n.id)
    
    let updatedNodes = state.nodes.filter(n => !childNodeIds.includes(n.id))
    let updatedConnections = state.connections.filter(c => 
      !childNodeIds.includes(c.to) && !childNodeIds.includes(c.from)
    )

    // Criar mini-nodes automaticamente para Menu Lista WhatsApp
    if (node.type === 'action-whatsapp-list' && config.listOptions?.length > 0) {
      const baseX = node.position.x + 210
      const baseY = node.position.y - 12
      const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo', 'red', 'teal']
      
      config.listOptions.forEach((option: any, index: number) => {
        const miniNodeId = `${nodeId}-option-${index}`
        const color = colors[index % colors.length]
        
        const miniNode: FlowNode = {
          id: miniNodeId,
          type: 'menu-option', // ✅ Usar novo tipo menu-option
          position: { 
            x: baseX, 
            y: baseY + (index * 44)
          },
          config: {
            message: `Você selecionou: ${option.title}`,
            isMenuOption: true,
            isMiniNode: true,
            parentNodeId: nodeId,
            optionIndex: index,
            optionTitle: option.title,
            optionDescription: option.description || '',
            borderColor: color
          }
        }
        
        updatedNodes.push(miniNode)
        
        updatedConnections.push({
          id: `${nodeId}-to-${miniNodeId}`,
          from: nodeId,
          to: miniNodeId,
          sourcePortIndex: index
        })
      })
    }

    // Criar mini-nodes automaticamente para Menu Lista Trigger
    if (node.type === 'trigger-menu-list' && config.menuOptions?.length > 0) {
      const baseX = node.position.x + 350
      const baseY = node.position.y - 50
      
      config.menuOptions.forEach((option: any, index: number) => {
        const miniNodeId = `${nodeId}-menu-${index}`
        
        const miniNode: FlowNode = {
          id: miniNodeId,
          type: option.actionType === 'whatsapp-text' ? 'action-whatsapp-text' :
                option.actionType === 'add-tag' ? 'action-contact-add-tag' :
                option.actionType === 'assign-fila' ? 'action-fila-assign' :
                'action-whatsapp-text',
          position: { 
            x: baseX, 
            y: baseY + (index * 120) 
          },
          config: {
            ...(option.actionConfig || {}),
            isMenuOption: true,
            parentNodeId: nodeId,
            optionIndex: index,
            optionKey: option.key,
            optionText: option.text
          }
        }
        
        updatedNodes.push(miniNode)
        
        updatedConnections.push({
          id: `${nodeId}-to-${miniNodeId}`,
          from: nodeId,
          to: miniNodeId
        })
      })
    }

    // Atualizar o node principal com a nova configuração
    updatedNodes = updatedNodes.map(n => 
      n.id === nodeId ? { ...n, config } : n
    )

    setState(prev => ({
      ...prev,
      nodes: updatedNodes,
      connections: updatedConnections,
      selectedNodeId: null
    }))
  }, [state.nodes, state.connections])

  // Save node configuration
  const handleNodeConfigSave = useCallback((config: Record<string, any>) => {
    if (!showNodeConfig) return

    // Usar o handleConfigUpdate para criar mini-nodes automaticamente
    handleConfigUpdate(showNodeConfig.nodeId, config)
    setShowNodeConfig(null)
  }, [showNodeConfig, handleConfigUpdate])

  // Helper functions to save nodes and connections
  const saveNodes = async (fluxoId: string, nodes: FlowNode[]) => {
    console.log(`Salvando ${nodes.length} nós para fluxo ${fluxoId}:`, nodes)
    
    const nodesData = nodes.map(node => ({
      nodeId: node.id,
      type: node.type,
      nome: `${NODE_TYPES[node.type as NodeType]?.label || node.type}`,
      position: node.position,
      config: node.config || {}
    }))
    
    const response = await fetch(`/api/fluxos/${fluxoId}/nodes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nodes: nodesData })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erro ao salvar nós: ${response.status} ${error}`)
    }

    const result = await response.json()
    console.log('Nós salvos com sucesso:', result)
    return result
  }

  const saveConnections = async (fluxoId: string, connections: FlowConnection[], idMapping?: Record<string, string>) => {
    console.log(`Salvando ${connections.length} conexões para fluxo ${fluxoId}:`, connections)
    console.log('Mapeamento de IDs:', idMapping)
    
    const connectionsData = connections.map(conn => ({
      connectionId: conn.id,
      fromNodeId: idMapping?.[conn.from] || conn.from, // Usar novo ID se disponível
      toNodeId: idMapping?.[conn.to] || conn.to       // Usar novo ID se disponível
    }))
    
    console.log('Dados das conexões com IDs mapeados:', connectionsData)
    
    const response = await fetch(`/api/fluxos/${fluxoId}/connections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ connections: connectionsData })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erro ao salvar conexões: ${response.status} ${error}`)
    }

    const result = await response.json()
    console.log('Conexões salvas com sucesso:', result)
    return result
  }

  // Load available quadros
  useEffect(() => {
    const loadQuadros = async () => {
      try {
        const response = await fetch('/api/kanban/quadros', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const quadros = await response.json()
          setAvailableQuadros(quadros)
        } else {
          console.error('Erro ao carregar quadros')
        }
      } catch (error) {
        console.error('Erro ao carregar quadros:', error)
      }
    }

    if (token) {
      loadQuadros()
    }
  }, [token])

  // Load existing flow data when editing
  useEffect(() => {
    const loadFlowData = async () => {
      if (!flowId || !token) return

      try {
        console.log('Carregando dados do fluxo:', flowId)
        const response = await fetch(`/api/fluxos/${flowId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const flowData = await response.json()
          console.log('Dados do fluxo carregados:', flowData)
          
          // Convert backend nodes to frontend format
          const nodes: FlowNode[] = (flowData.nos || []).map((node: any) => ({
            id: node.id,
            type: node.tipo as NodeType,
            position: typeof node.posicao === 'object' ? node.posicao : { x: 100, y: 100 },
            config: typeof node.configuracao === 'object' ? node.configuracao : {}
          }))

          // Convert backend connections to frontend format
          const connections: FlowConnection[] = []
          const processedConnectionIds = new Set<string>()
          
          if (flowData.nos) {
            flowData.nos.forEach((node: any) => {
              if (node.conexoesDe) {
                node.conexoesDe.forEach((conn: any) => {
                  // Only add connection if ID hasn't been processed yet
                  if (!processedConnectionIds.has(conn.id)) {
                    processedConnectionIds.add(conn.id)
                    connections.push({
                      id: conn.id,
                      from: conn.deId,
                      to: conn.paraId
                    })
                  }
                })
              }
            })
          }

          console.log('Nós convertidos:', nodes)
          console.log('Conexões convertidas:', connections)

          setState(prev => ({
            ...prev,
            nodes,
            connections
          }))
        } else {
          console.error('Erro ao carregar dados do fluxo')
        }
      } catch (error) {
        console.error('Erro ao carregar dados do fluxo:', error)
      }
    }

    loadFlowData()
  }, [flowId, token])

  // Save flow
  const handleSaveFlow = async () => {
    try {
      let savedFlow
      
      if (flowId) {
        // ATUALIZAR fluxo existente
        console.log('Atualizando fluxo existente:', flowId)
        
        const updateData = {
          nome: `Fluxo ${new Date().toLocaleDateString()}`,
          descricao: 'Fluxo de automação atualizado no editor',
          ativo: true
        }

        const response = await fetch(`/api/fluxos/${flowId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`Erro ao atualizar fluxo: ${response.status} ${errorData}`)
        }
        
        savedFlow = await response.json()
        savedFlow.id = flowId // Garantir que o ID está correto
        console.log('Flow updated successfully:', savedFlow)
        
      } else {
        // CRIAR novo fluxo
        console.log('Criando novo fluxo')
        
        // Verificar se há quadros disponíveis
        if (availableQuadros.length === 0) {
          alert('Nenhum quadro encontrado. Crie um quadro primeiro no Kanban.')
          return
        }

        const quadroId = availableQuadros[0]?.id
        console.log('Quadros disponíveis:', availableQuadros)
        console.log('Usando quadroId:', quadroId)

        const flowData = {
          nome: `Fluxo ${new Date().toLocaleDateString()}`,
          descricao: 'Fluxo de automação criado no editor',
          quadroId: quadroId,
          ativo: true
        }

        console.log('Creating flow:', flowData)
        
        const response = await fetch('/api/fluxos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(flowData)
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`Erro ao criar fluxo: ${response.status} ${errorData}`)
        }
        
        savedFlow = await response.json()
        console.log('Flow created successfully:', savedFlow)
      }

      // Salvar nós e conexões separadamente
      const fluxoId = savedFlow.id
      try {
        console.log('Salvando nós:', state.nodes)
        console.log('Salvando conexões:', state.connections)
        
        let idMapping: Record<string, string> = {}
        
        // Sempre salvar nós (mesmo se array vazio) para deletar nós existentes
        const nodesResult = await saveNodes(fluxoId, state.nodes)
        idMapping = nodesResult.idMapping || {}
        console.log('Nós salvos com sucesso! Mapeamento de IDs:', idMapping)
        
        // Sempre salvar conexões (mesmo se array vazio) para deletar conexões existentes  
        await saveConnections(fluxoId, state.connections, idMapping)
        console.log('Conexões salvas com sucesso!')
        
      } catch (nodeError) {
        console.error('Erro ao salvar nós/conexões:', nodeError)
        alert('Fluxo salvo, mas houve erro ao salvar nós/conexões: ' + nodeError.message)
        return
      }
      
      alert('Fluxo salvo com sucesso!')
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

      // Verificar se temos um flowId válido (fluxo salvo)
      if (!flowId) {
        alert('Salve o fluxo antes de executar')
        return
      }

      // Formato esperado pelo backend
      const executionData = {
        contatoId: "test-contact-id", // Por enquanto um ID de teste
        dados: {
          triggerNodes: triggerNodes.map(node => ({
            id: node.id,
            type: node.type,
            config: node.config || {}
          })),
          totalNodes: state.nodes.length,
          totalConnections: state.connections.length
        }
      }

      // Verificar se o token existe
      if (!token) {
        alert('Token de autenticação não encontrado. Faça login novamente.')
        return
      }

      // Verificar se o token está válido tentando buscar dados do localStorage diretamente
      const localToken = localStorage.getItem('token')
      const tokenToUse = token || localToken

      if (!tokenToUse) {
        alert('Nenhum token encontrado. Faça login novamente.')
        return
      }

      console.log('🔑 Token useAuth:', token ? 'Presente' : 'Ausente')
      console.log('🔑 Token localStorage:', localToken ? 'Presente' : 'Ausente')
      console.log('🔑 Token que será usado:', tokenToUse ? `${tokenToUse.substring(0, 20)}...` : 'Nenhum')
      console.log('📋 Dados de execução:', executionData)

      const headers = {
        'Authorization': `Bearer ${tokenToUse}`,
        'Content-Type': 'application/json',
      }
      
      console.log('📤 Headers que serão enviados:', headers)
      console.log('🎯 URL de destino:', `/api/fluxos/${flowId}/execute`)

      // Call backend execution API com ID do fluxo
      const response = await fetch(`/api/fluxos/${flowId}/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify(executionData)
      })

      console.log('📥 Status da resposta:', response.status)
      console.log('📥 Headers da resposta:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const result = await response.json()
        console.log('Flow execution started:', result)
        alert('Fluxo executado com sucesso!')
      } else {
        const errorText = await response.text()
        console.error('Erro na execução:', errorText)
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.error('Error executing flow:', error)
      alert('Erro ao executar fluxo: ' + error.message)
    }
  }, [state, flowId, token])

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
      <NodePalette onNodeSelect={handleNodeAdd} isDark={isDark} />

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

          {/* Clear All Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearAll}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isDark ? 'bg-red-700 hover:bg-red-600 text-red-300' : 'bg-red-100 hover:bg-red-200 text-red-600'
            }`}
            title="Apagar todos os nós do fluxo"
          >
            <Trash2 className="w-4 h-4" />
            <span>Apagar todos</span>
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
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className={`relative flex-1 overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}
          style={{
            backgroundImage: isDark 
              ? 'radial-gradient(circle, #374151 1px, transparent 1px)'
              : 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
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
            {state.nodes.map(node => {
              const outgoingConnections = state.connections.filter(conn => conn.from === node.id)
              const menuOptions = Array.isArray(node.config?.listOptions) ? node.config.listOptions : []
              const menuPortCount = node.type === 'action-whatsapp-list'
                ? Math.max(menuOptions.length, outgoingConnections.length || 0)
                : undefined

              return (
                <FlowNodeComponent
                  key={node.id}
                  node={node}
                  isSelected={state.selectedNodeId === node.id}
                  isDark={isDark}
                  onDragStart={handleNodeDragStart}
                  onConfigOpen={(nodeId) => handleConfigEdit(nodeId, {})}
                  onConnectionStart={handleConnectionStart}
                  onConnectionEnd={handleConnectionEnd}
                  onDelete={handleNodeDelete}
                  menuPortCount={menuPortCount}
                />
              )
            })}

                {/* Render Connections */}
                <svg className="absolute inset-0 pointer-events-none w-full h-full">
                  {/* Existing connections */}
                  {state.connections.map(connection => {
                    const fromNode = state.nodes.find(n => n.id === connection.from)
                    const toNode = state.nodes.find(n => n.id === connection.to)
                    
                    if (!fromNode || !toNode) return null

                    // ✅ Detectar se é mini-node para calcular tamanho correto
                    const fromMenuOptions = Array.isArray(fromNode.config?.listOptions) ? fromNode.config.listOptions : []
                    const siblingConnections = state.connections.filter(c => c.from === fromNode.id)
                    const menuPortCount = fromNode.type === 'action-whatsapp-list'
                      ? Math.max(fromMenuOptions.length, siblingConnections.length || 0)
                      : undefined
                    const { width: fromWidth, height: fromHeight } = getNodeDimensions(fromNode, menuPortCount)
                    const toMenuOptions = Array.isArray(toNode.config?.listOptions) ? toNode.config.listOptions : []
                    const toSiblingConnections = state.connections.filter(c => c.from === toNode.id)
                    const toMenuPortCount = toNode.type === 'action-whatsapp-list'
                      ? Math.max(toMenuOptions.length, toSiblingConnections.length || 0)
                      : undefined
                    const { height: toHeight } = getNodeDimensions(toNode, toMenuPortCount)

                    // ✅ Connection points alinhados com as bolinhas
                    const startX = fromNode.position.x + fromWidth
                    const siblingIndex = siblingConnections.findIndex(c => c.id === connection.id)
                    const fallbackIndex = siblingIndex === -1 ? 0 : siblingIndex
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
                      return fallbackIndex
                    })()
                    let startY = fromNode.position.y + fromHeight / 2
                    if (fromNode.type === 'action-whatsapp-list') {
                      const ratio = getMenuOptionAnchorRatio(fromNode, derivedSourceIndex, menuPortCount)
                      startY = fromNode.position.y + fromHeight * ratio
                    }
                    
                    const endX = toNode.position.x
                    const endY = toNode.position.y + toHeight / 2

                    const horizontalDistance = Math.abs(endX - startX)
                    const controlOffset = Math.max(horizontalDistance * 0.4, 60)
                    const controlPointStart = startX + controlOffset
                    const controlPointEnd = endX - controlOffset

                    return (
                      <g key={connection.id}>
                        {/* Definir gradientes */}
                        <defs>
                          <linearGradient id={`gradient-${connection.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.85" />
                          </linearGradient>
                          <marker 
                            id={`arrowhead-${connection.id}`} 
                            markerWidth="8" 
                            markerHeight="6" 
                            refX="7" 
                            refY="3" 
                            orient="auto"
                          >
                            <polygon 
                              points="0 0, 8 3, 0 6" 
                              fill={isDark ? '#3B82F6' : '#2563EB'} 
                            />
                          </marker>
                        </defs>
                        
                        {/* Linha de fundo (sombra) */}
                        <path
                          d={`M ${startX} ${startY} C ${controlPointStart} ${startY}, ${controlPointEnd} ${endY}, ${endX} ${endY}`}
                          stroke={isDark ? '#1F2937' : '#E5E7EB'}
                          strokeWidth="2.6"
                          fill="none"
                          opacity="0.3"
                        />
                        
                        {/* Linha principal com gradiente */}
                        <path
                          d={`M ${startX} ${startY} C ${controlPointStart} ${startY}, ${controlPointEnd} ${endY}, ${endX} ${endY}`}
                          stroke={`url(#gradient-${connection.id})`}
                          strokeWidth="1.75"
                          fill="none"
                          markerEnd={`url(#arrowhead-${connection.id})`}
                          className="hover:stroke-opacity-100 cursor-pointer transition-all duration-200"
                          style={{ filter: 'drop-shadow(0 1px 2px rgba(59, 130, 246, 0.25))' }}
                        />
                        
                        {/* Ponto de origem */}
                        <circle
                          cx={startX}
                          cy={startY}
                          r="2.4"
                          fill="#10B981"
                          stroke="#ecfdf5"
                          strokeWidth="1"
                          className="drop-shadow-sm"
                        />
                      </g>
                    )
                  })}
                  
                  {/* Temporary connection line */}
                  {isConnecting && connectionStart && (
                    <g>
                      <defs>
                        <linearGradient id="temp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.85" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M ${connectionStart.x} ${connectionStart.y} Q ${(connectionStart.x + mousePosition.x) / 2} ${connectionStart.y} ${mousePosition.x} ${mousePosition.y}`}
                        stroke="url(#temp-gradient)"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="4 4"
                        className="animate-pulse pointer-events-none"
                      />
                      <circle
                        cx={connectionStart.x}
                        cy={connectionStart.y}
                        r="4"
                        fill="#10B981"
                        stroke="white"
                        strokeWidth="1.2"
                        className="pointer-events-none"
                      />
                      <circle
                        cx={mousePosition.x}
                        cy={mousePosition.y}
                        r="3.4"
                        fill="#3B82F6"
                        stroke="white"
                        strokeWidth="1.2"
                        className="pointer-events-none"
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

      {/* AI Generate Modal */}
      {showAiModal && (
        <AiGenerateModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onGenerate={handleAiGenerate}
        />
      )}
    </div>
  )
}
