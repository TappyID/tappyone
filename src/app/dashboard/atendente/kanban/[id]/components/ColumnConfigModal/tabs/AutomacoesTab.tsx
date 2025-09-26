'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, ArrowRight, Clock, Mail, MessageSquare, 
  User, Tag, Calendar, DollarSign, FileText,
  PlayCircle, PauseCircle, Settings, Plus,
  GitBranch, Workflow, Bot
} from 'lucide-react'
import AutomacaoCard from '../components/AutomacaoCard'

interface AutomacoesTabProps {
  coluna: {
    id: string
    nome: string
    cor: string
  }
  theme: string
}

interface Automacao {
  id: string
  nome: string
  descricao: string
  trigger: string
  actions: string[]
  ativa: boolean
  icon: any
}

export default function AutomacoesTab({ coluna, theme }: AutomacoesTabProps) {
  const [automacoes, setAutomacoes] = useState<Automacao[]>([
    {
      id: '1',
      nome: 'Notificar ao mover card',
      descricao: 'Envia notificação quando um card entra nesta coluna',
      trigger: 'card_movido',
      actions: ['enviar_email', 'enviar_whatsapp'],
      ativa: true,
      icon: ArrowRight
    },
    {
      id: '2',
      nome: 'Auto-tag por tempo',
      descricao: 'Adiciona tag "urgente" se o card ficar mais de 3 dias',
      trigger: 'tempo_na_coluna',
      actions: ['adicionar_tag'],
      ativa: false,
      icon: Clock
    },
    {
      id: '3',
      nome: 'Criar tarefa automática',
      descricao: 'Cria tarefas padrão quando card entra na coluna',
      trigger: 'card_adicionado',
      actions: ['criar_tarefa', 'atribuir_responsavel'],
      ativa: true,
      icon: FileText
    }
  ])

  const [showNewAutomacao, setShowNewAutomacao] = useState(false)
  const [selectedTrigger, setSelectedTrigger] = useState('')
  const [selectedActions, setSelectedActions] = useState<string[]>([])

  const triggers = [
    { id: 'card_movido', label: 'Card movido para coluna', icon: ArrowRight },
    { id: 'tempo_na_coluna', label: 'Tempo na coluna excedido', icon: Clock },
    { id: 'meta_atingida', label: 'Meta atingida', icon: DollarSign },
    { id: 'tag_adicionada', label: 'Tag específica adicionada', icon: Tag },
    { id: 'prazo_proximo', label: 'Prazo se aproximando', icon: Calendar }
  ]

  const actions = [
    { id: 'enviar_email', label: 'Enviar email', icon: Mail },
    { id: 'enviar_whatsapp', label: 'Enviar WhatsApp', icon: MessageSquare },
    { id: 'adicionar_tag', label: 'Adicionar tag', icon: Tag },
    { id: 'atribuir_responsavel', label: 'Atribuir responsável', icon: User },
    { id: 'criar_tarefa', label: 'Criar tarefa', icon: FileText },
    { id: 'mover_card', label: 'Mover para outra coluna', icon: ArrowRight }
  ]

  const toggleAutomacao = (id: string) => {
    setAutomacoes(automacoes.map(a => 
      a.id === id ? { ...a, ativa: !a.ativa } : a
    ))
  }

  const deleteAutomacao = (id: string) => {
    setAutomacoes(automacoes.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header com IA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl backdrop-blur-xl border ${
          theme === 'dark' 
            ? 'bg-slate-900/50 border-slate-700/30' 
            : 'bg-white/80 border-gray-200/30'
        }`}
        style={{
          background: `linear-gradient(135deg, ${coluna.cor}05 0%, transparent 100%)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              className="p-3 rounded-xl relative"
              style={{ 
                backgroundColor: `${coluna.cor}20`,
                color: coluna.cor 
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Bot className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Automações Inteligentes
                <span className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  IA
                </span>
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Configure fluxos automáticos com inteligência artificial
              </p>
            </div>
          </div>

          <motion.button
            onClick={() => setShowNewAutomacao(!showNewAutomacao)}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
            style={{
              boxShadow: `0 4px 15px ${coluna.cor}20`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Workflow className="w-4 h-4" />
            Nova Automação
          </motion.button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <div className={`p-3 rounded-xl text-center ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <Zap className="w-5 h-5 mx-auto mb-1" style={{ color: coluna.cor }} />
            <p className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {automacoes.length}
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total
            </p>
          </div>

          <div className={`p-3 rounded-xl text-center ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <PlayCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-green-500">
              {automacoes.filter(a => a.ativa).length}
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Ativas
            </p>
          </div>

          <div className={`p-3 rounded-xl text-center ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <PauseCircle className="w-5 h-5 mx-auto mb-1 text-gray-400" />
            <p className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {automacoes.filter(a => !a.ativa).length}
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Pausadas
            </p>
          </div>

          <div className={`p-3 rounded-xl text-center ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <GitBranch className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-blue-500">
              {automacoes.reduce((acc, a) => acc + a.actions.length, 0)}
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Ações
            </p>
          </div>
        </div>
      </motion.div>

      {/* Criar Nova Automação */}
      <AnimatePresence>
        {showNewAutomacao && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-6 rounded-2xl backdrop-blur-xl border ${
              theme === 'dark' 
                ? 'bg-slate-900/50 border-slate-700/30' 
                : 'bg-white/80 border-gray-200/30'
            }`}
          >
            <h4 className={`text-lg font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              🤖 Configurar Nova Automação
            </h4>

            {/* Triggers */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Quando (Gatilho)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {triggers.map(trigger => {
                  const Icon = trigger.icon
                  const isSelected = selectedTrigger === trigger.id
                  
                  return (
                    <motion.button
                      key={trigger.id}
                      onClick={() => setSelectedTrigger(trigger.id)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-2'
                          : theme === 'dark'
                            ? 'border-slate-700 hover:border-slate-600'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: isSelected ? coluna.cor : undefined,
                        backgroundColor: isSelected ? `${coluna.cor}10` : undefined
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon 
                        className="w-4 h-4 mb-1 mx-auto" 
                        style={{ color: isSelected ? coluna.cor : undefined }}
                      />
                      <p className={`text-xs ${
                        isSelected
                          ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                          : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {trigger.label}
                      </p>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Então (Ações)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {actions.map(action => {
                  const Icon = action.icon
                  const isSelected = selectedActions.includes(action.id)
                  
                  return (
                    <motion.button
                      key={action.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedActions(selectedActions.filter(a => a !== action.id))
                        } else {
                          setSelectedActions([...selectedActions, action.id])
                        }
                      }}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-2'
                          : theme === 'dark'
                            ? 'border-slate-700 hover:border-slate-600'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: isSelected ? coluna.cor : undefined,
                        backgroundColor: isSelected ? `${coluna.cor}10` : undefined
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon 
                        className="w-4 h-4 mb-1 mx-auto" 
                        style={{ color: isSelected ? coluna.cor : undefined }}
                      />
                      <p className={`text-xs ${
                        isSelected
                          ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                          : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {action.label}
                      </p>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <motion.button
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: coluna.cor }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Criar Automação
              </motion.button>
              
              <motion.button
                onClick={() => setShowNewAutomacao(false)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Automações */}
      <div className="space-y-3">
        {automacoes.map((automacao, index) => (
          <AutomacaoCard
            key={automacao.id}
            automacao={automacao}
            theme={theme}
            coluna={coluna}
            onToggle={toggleAutomacao}
            onDelete={deleteAutomacao}
            delay={index * 0.1}
          />
        ))}
      </div>
    </div>
  )
}
