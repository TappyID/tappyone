'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { UserCheck, Users, Bot, Crown, Shield } from 'lucide-react'
import { TopBarButton } from './TopBarButton'

interface Agent {
  id: string
  name: string
  type: 'human' | 'ai' | 'admin'
  status: 'online' | 'offline' | 'busy'
  avatar?: string
  activeChats: number
}

const agents: Agent[] = [
  { id: '1', name: 'João Silva', type: 'human', status: 'online', activeChats: 3 },
  { id: '2', name: 'Maria Santos', type: 'human', status: 'busy', activeChats: 5 },
  { id: '3', name: 'IA Assistant', type: 'ai', status: 'online', activeChats: 12 },
  { id: '4', name: 'Admin', type: 'admin', status: 'online', activeChats: 0 }
]

interface AgentSelectorProps {
  sidebarCollapsed?: boolean
}

export function AgentSelector({ sidebarCollapsed = true }: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(agents[0])

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsOpen(false)
    console.log('Agente selecionado:', agent.name)
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'ai': return Bot
      case 'admin': return Crown
      default: return UserCheck
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const onlineAgents = agents.filter(a => a.status === 'online').length

  return (
    <TopBarButton
      icon={UserCheck}
      onClick={() => setIsOpen(!isOpen)}
      sidebarCollapsed={sidebarCollapsed}
      badge={onlineAgents}
      badgeColor="bg-green-500"
      tooltip={`Agente: ${selectedAgent.name}`}
    >
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Users size={16} className="text-[#273155]" />
                Selecionar Agente
              </h3>
            </div>

            {/* Agent List */}
            <div className="max-h-64 overflow-y-auto">
              {agents.map((agent) => {
                const AgentIcon = getAgentIcon(agent.type)
                return (
                  <motion.button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent)}
                    className="w-full px-3 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200 text-left"
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#273155] to-[#1e2442] rounded-full flex items-center justify-center">
                        <AgentIcon size={14} className="text-white" />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(agent.status)} rounded-full border-2 border-white`}></div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {agent.name}
                        {agent.type === 'admin' && <Crown size={12} className="text-yellow-500" />}
                        {agent.type === 'ai' && <Bot size={12} className="text-blue-500" />}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="capitalize">{agent.status}</span>
                        {agent.activeChats > 0 && (
                          <span>• {agent.activeChats} chats ativos</span>
                        )}
                      </div>
                    </div>

                    {selectedAgent.id === agent.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Shield size={16} className="text-[#273155]" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                {onlineAgents} agentes online
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TopBarButton>
  )
}
