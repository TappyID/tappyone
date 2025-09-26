'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { NodeType, NODE_TYPES } from './FluxoNodes'
import { useConexoes } from '@/hooks/useConexoes'
import { useFilas } from '@/hooks/useFilas'
import { useAtendentes } from '@/hooks/useAtendentes'
import { useTags } from '@/hooks/useTags'
import { useWhatsAppData } from '@/hooks/useWhatsAppData'

interface NodeConfigModalProps {
  nodeId: string
  nodeType: NodeType
  initialConfig: Record<string, any>
  isOpen: boolean
  onSave: (config: Record<string, any>) => void
  onClose: () => void
}

export default function NodeConfigModal({
  nodeId,
  nodeType,
  initialConfig,
  isOpen,
  onSave,
  onClose
}: NodeConfigModalProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const [config, setConfig] = useState<Record<string, any>>(initialConfig)
  
  // Hooks para buscar dados reais do sistema
  const { conexoes } = useConexoes()
  const { filas } = useFilas()
  const { atendentes } = useAtendentes()
  const { tags } = useTags()
  const { chats: whatsAppChats } = useWhatsAppData()

  useEffect(() => {
    setConfig(initialConfig)
  }, [initialConfig, nodeId])

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const nodeInfo = NODE_TYPES[nodeType]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg rounded-xl shadow-2xl ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${nodeInfo.color}-100 dark:bg-${nodeInfo.color}-900`}>
                <nodeInfo.icon className={`w-5 h-5 text-${nodeInfo.color}-600 dark:text-${nodeInfo.color}-400`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Configurar {nodeInfo.label}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {nodeInfo.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {renderNodeConfig(nodeType, config, updateConfig, isDark, {
              conexoes,
              filas,
              atendentes,
              tags,
              whatsAppChats
            })}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end space-x-3 p-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function renderNodeConfig(
  nodeType: NodeType,
  config: Record<string, any>,
  updateConfig: (field: string, value: any) => void,
  isDark: boolean,
  systemData: {
    conexoes: any[]
    filas: any[]
    atendentes: any[]
    tags: any[]
    whatsAppChats: any[]
  }
): React.ReactNode {
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    isDark 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`

  switch (nodeType) {
    // ============= MÚLTIPLAS AÇÕES =============
    case 'action-multi':
      const actions = config.actions || []
      
      return (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-200'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🔗 Múltiplas Ações (Executadas em Sequência)
            </h4>
            
            {/* Lista de Ações */}
            <div className="space-y-3">
              {actions.map((action: any, index: number) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Ação {index + 1}: {NODE_TYPES[action.type as NodeType]?.label || action.type}
                    </span>
                    <div className="flex space-x-1">
                      {/* Botão Mover para Cima */}
                      {index > 0 && (
                        <button
                          onClick={() => {
                            const newActions = [...actions]
                            ;[newActions[index], newActions[index - 1]] = [newActions[index - 1], newActions[index]]
                            updateConfig('actions', newActions)
                          }}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-500' : 'hover:bg-gray-200'}`}
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                      )}
                      
                      {/* Botão Mover para Baixo */}
                      {index < actions.length - 1 && (
                        <button
                          onClick={() => {
                            const newActions = [...actions]
                            ;[newActions[index], newActions[index + 1]] = [newActions[index + 1], newActions[index]]
                            updateConfig('actions', newActions)
                          }}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-500' : 'hover:bg-gray-200'}`}
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                      )}
                      
                      {/* Botão Remover */}
                      <button
                        onClick={() => {
                          const newActions = actions.filter((_: any, i: number) => i !== index)
                          updateConfig('actions', newActions)
                        }}
                        className={`p-1 rounded text-red-500 ${isDark ? 'hover:bg-gray-500' : 'hover:bg-gray-200'}`}
                        title="Remover ação"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  {/* Configuração da Ação */}
                  <div className="space-y-2">
                    {action.type === 'action-whatsapp-text' && (
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Mensagem
                        </label>
                        <textarea
                          value={action.message || ''}
                          onChange={(e) => {
                            const newActions = [...actions]
                            newActions[index] = { ...newActions[index], message: e.target.value }
                            updateConfig('actions', newActions)
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border ${
                            isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                          } focus:ring-2 focus:ring-purple-500`}
                          rows={2}
                          placeholder="Digite a mensagem..."
                        />
                      </div>
                    )}
                    
                    {action.type === 'action-contact-add-tag' && (
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Tag
                        </label>
                        <select
                          value={action.tag || ''}
                          onChange={(e) => {
                            const newActions = [...actions]
                            newActions[index] = { ...newActions[index], tag: e.target.value }
                            updateConfig('actions', newActions)
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border ${
                            isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                          } focus:ring-2 focus:ring-purple-500`}
                        >
                          <option value="">Selecione uma tag</option>
                          {systemData.tags.map(tag => (
                            <option key={tag.id} value={tag.nome}>
                              {tag.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {action.type === 'action-fila-assign' && (
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Fila
                        </label>
                        <select
                          value={action.filaId || ''}
                          onChange={(e) => {
                            const newActions = [...actions]
                            newActions[index] = { ...newActions[index], filaId: e.target.value }
                            updateConfig('actions', newActions)
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border ${
                            isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                          } focus:ring-2 focus:ring-purple-500`}
                        >
                          <option value="">Selecione uma fila</option>
                          {systemData.filas.map(fila => (
                            <option key={fila.id} value={fila.id}>
                              {fila.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Adicionar Nova Ação */}
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Adicionar Ação
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const newAction = {
                      type: e.target.value,
                      ...(e.target.value === 'action-whatsapp-text' && { message: '' }),
                      ...(e.target.value === 'action-contact-add-tag' && { tag: '' }),
                      ...(e.target.value === 'action-fila-assign' && { filaId: '' }),
                      ...(e.target.value === 'action-contact-create' && { nome: '', telefone: '' }),
                      ...(e.target.value === 'action-kanban-create' && { titulo: '' }),
                    }
                    updateConfig('actions', [...actions, newAction])
                    e.target.value = '' // Reset select
                  }
                }}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-purple-500`}
              >
                <option value="">Selecione o tipo de ação</option>
                <option value="action-whatsapp-text">📱 Enviar Texto WhatsApp</option>
                <option value="action-contact-add-tag">🏷️ Adicionar Tag ao Contato</option>
                <option value="action-fila-assign">📋 Atribuir à Fila</option>
                <option value="action-contact-create">👤 Criar Contato</option>
                <option value="action-kanban-create">📊 Criar Card Kanban</option>
              </select>
            </div>
            
            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                💡 <strong>Dica:</strong> As ações serão executadas na ordem listada acima. Use os botões ↑↓ para reordenar.
              </p>
            </div>
          </div>
        </div>
      )

    // ============= TRIGGERS =============
    case 'trigger-login-system':
      return (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-purple-900 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🔐 Gatilho: Login no Sistema
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Este fluxo será executado automaticamente quando um usuário fizer login no sistema.
            </p>
          </div>
          
          <div>
            <label className={labelClass}>Tipo de Usuário</label>
            <select 
              value={config.userType || ''} 
              onChange={(e) => updateConfig('userType', e.target.value)}
              className={inputClass}
            >
              <option value="">Todos os usuários</option>
              <option value="ADMIN">Apenas Administradores</option>
              <option value="ATENDENTE">Apenas Atendentes</option>
              <option value="ASSINANTE">Apenas Assinantes</option>
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Executar apenas na primeira vez?</label>
            <select 
              value={config.firstLoginOnly || 'false'} 
              onChange={(e) => updateConfig('firstLoginOnly', e.target.value === 'true')}
              className={inputClass}
            >
              <option value="false">Não - A cada login</option>
              <option value="true">Sim - Apenas no primeiro login</option>
            </select>
          </div>
        </div>
      )

    case 'trigger-flow-start':
      return (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ▶️ Gatilho: Início do Fluxo
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Este fluxo será executado quando iniciado manualmente por um usuário ou sistema.
            </p>
          </div>
          
          <div>
            <label className={labelClass}>Parâmetros Obrigatórios</label>
            <textarea
              value={config.requiredParams || ''}
              onChange={(e) => updateConfig('requiredParams', e.target.value)}
              placeholder="contatoId, telefone (um por linha)"
              rows={3}
              className={inputClass}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Parâmetros que devem ser fornecidos ao executar o fluxo
            </p>
          </div>
          
          <div>
            <label className={labelClass}>Descrição do Fluxo</label>
            <input
              type="text"
              value={config.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
              placeholder="Descrição clara do que este fluxo faz"
              className={inputClass}
            />
          </div>
        </div>
      )

    case 'trigger-whatsapp-message':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Palavra-chave (opcional)</label>
            <input
              type="text"
              value={config.keyword || ''}
              onChange={(e) => updateConfig('keyword', e.target.value)}
              placeholder="Ex: oi, menu, ajuda (deixe vazio para qualquer mensagem)"
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Conexão WhatsApp</label>
            <select 
              value={config.conexaoId || ''} 
              onChange={(e) => updateConfig('conexaoId', e.target.value)}
              className={inputClass}
            >
              <option value="">Todas as conexões</option>
              {systemData.conexoes.map(conexao => (
                <option key={conexao.id} value={conexao.id}>
                  {conexao.nome} - {conexao.numero}
                </option>
              ))}
            </select>
          </div>
        </div>
      )

    case 'trigger-keyword':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Palavras-chave *</label>
            <input
              type="text"
              value={config.keywords || ''}
              onChange={(e) => updateConfig('keywords', e.target.value)}
              placeholder="Ex: oi, olá, menu, ajuda (separadas por vírgula)"
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Tipo de Correspondência</label>
            <select 
              value={config.matchType || 'exact'} 
              onChange={(e) => updateConfig('matchType', e.target.value)}
              className={inputClass}
            >
              <option value="exact">Correspondência Exata</option>
              <option value="contains">Contém a palavra</option>
              <option value="starts">Começa com a palavra</option>
            </select>
          </div>
        </div>
      )

    case 'trigger-menu-list':
      const menuOptions = config.menuOptions || []
      
      return (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-200'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📋 Menu Interativo com Mini-Nodes
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Crie um menu com múltiplas opções, cada uma com sua própria ação configurada.
            </p>
          </div>
          
          <div>
            <label className={labelClass}>Mensagem de Introdução do Menu *</label>
            <textarea
              value={config.menuMessage || ''}
              onChange={(e) => updateConfig('menuMessage', e.target.value)}
              placeholder="Digite aqui a mensagem que será enviada antes do menu..."
              rows={3}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Título do Menu</label>
            <input
              type="text"
              value={config.menuTitle || ''}
              onChange={(e) => updateConfig('menuTitle', e.target.value)}
              placeholder="Ex: Escolha uma opção:"
              className={inputClass}
            />
          </div>
          
          {/* Opções do Menu */}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🔗 Opções do Menu (Mini-Nodes)
            </h4>
            
            <div className="space-y-3">
              {menuOptions.map((option: any, index: number) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Opção {index + 1}: {option.text || 'Sem texto'}
                    </span>
                    <div className="flex space-x-1">
                      {/* Mover para cima */}
                      {index > 0 && (
                        <button
                          onClick={() => {
                            const newOptions = [...menuOptions]
                            ;[newOptions[index], newOptions[index - 1]] = [newOptions[index - 1], newOptions[index]]
                            updateConfig('menuOptions', newOptions)
                          }}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-500' : 'hover:bg-gray-200'}`}
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                      )}
                      
                      {/* Mover para baixo */}
                      {index < menuOptions.length - 1 && (
                        <button
                          onClick={() => {
                            const newOptions = [...menuOptions]
                            ;[newOptions[index], newOptions[index + 1]] = [newOptions[index + 1], newOptions[index]]
                            updateConfig('menuOptions', newOptions)
                          }}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-500' : 'hover:bg-gray-200'}`}
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                      )}
                      
                      {/* Remover */}
                      <button
                        onClick={() => {
                          const newOptions = menuOptions.filter((_: any, i: number) => i !== index)
                          updateConfig('menuOptions', newOptions)
                        }}
                        className={`p-1 rounded text-red-500 ${isDark ? 'hover:bg-gray-500' : 'hover:bg-gray-200'}`}
                        title="Remover opção"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  {/* Configuração da Opção */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Número/Letra *
                        </label>
                        <input
                          type="text"
                          value={option.key || ''}
                          onChange={(e) => {
                            const newOptions = [...menuOptions]
                            newOptions[index] = { ...newOptions[index], key: e.target.value }
                            updateConfig('menuOptions', newOptions)
                          }}
                          placeholder="1, 2, A, B..."
                          className={`w-full px-2 py-1 text-sm rounded border ${
                            isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Tipo de Ação *
                        </label>
                        <select
                          value={option.actionType || ''}
                          onChange={(e) => {
                            const newOptions = [...menuOptions]
                            newOptions[index] = { ...newOptions[index], actionType: e.target.value, actionConfig: {} }
                            updateConfig('menuOptions', newOptions)
                          }}
                          className={`w-full px-2 py-1 text-sm rounded border ${
                            isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        >
                          <option value="">Selecionar...</option>
                          <option value="whatsapp-text">💬 Enviar Mensagem</option>
                          <option value="add-tag">🏷️ Adicionar Tag</option>
                          <option value="assign-fila">📋 Atribuir Fila</option>
                          <option value="create-contact">👤 Criar Contato</option>
                          <option value="create-kanban">📊 Criar Card Kanban</option>
                          <option value="transfer-agent">🔄 Transferir Atendente</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Texto da Opção *
                      </label>
                      <input
                        type="text"
                        value={option.text || ''}
                        onChange={(e) => {
                          const newOptions = [...menuOptions]
                          newOptions[index] = { ...newOptions[index], text: e.target.value }
                          updateConfig('menuOptions', newOptions)
                        }}
                        placeholder="Ex: Falar com atendente, Ver produtos..."
                        className={`w-full px-2 py-1 text-sm rounded border ${
                          isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    {/* Configuração específica da ação */}
                    {option.actionType === 'whatsapp-text' && (
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Mensagem de Resposta
                        </label>
                        <textarea
                          value={option.actionConfig?.message || ''}
                          onChange={(e) => {
                            const newOptions = [...menuOptions]
                            newOptions[index] = { 
                              ...newOptions[index], 
                              actionConfig: { ...newOptions[index].actionConfig, message: e.target.value }
                            }
                            updateConfig('menuOptions', newOptions)
                          }}
                          placeholder="Mensagem que será enviada..."
                          rows={2}
                          className={`w-full px-2 py-1 text-sm rounded border ${
                            isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        />
                      </div>
                    )}
                    
                    {option.actionType === 'add-tag' && (
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Tag
                        </label>
                        <select
                          value={option.actionConfig?.tagId || ''}
                          onChange={(e) => {
                            const newOptions = [...menuOptions]
                            newOptions[index] = { 
                              ...newOptions[index], 
                              actionConfig: { ...newOptions[index].actionConfig, tagId: e.target.value }
                            }
                            updateConfig('menuOptions', newOptions)
                          }}
                          className={`w-full px-2 py-1 text-sm rounded border ${
                            isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        >
                          <option value="">Selecione uma tag</option>
                          {systemData.tags.map(tag => (
                            <option key={tag.id} value={tag.id}>
                              {tag.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {option.actionType === 'assign-fila' && (
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Fila
                        </label>
                        <select
                          value={option.actionConfig?.filaId || ''}
                          onChange={(e) => {
                            const newOptions = [...menuOptions]
                            newOptions[index] = { 
                              ...newOptions[index], 
                              actionConfig: { ...newOptions[index].actionConfig, filaId: e.target.value }
                            }
                            updateConfig('menuOptions', newOptions)
                          }}
                          className={`w-full px-2 py-1 text-sm rounded border ${
                            isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        >
                          <option value="">Selecione uma fila</option>
                          {systemData.filas.map(fila => (
                            <option key={fila.id} value={fila.id}>
                              {fila.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Adicionar Nova Opção */}
            <button
              onClick={() => {
                const newOption = {
                  key: (menuOptions.length + 1).toString(),
                  text: '',
                  actionType: '',
                  actionConfig: {}
                }
                updateConfig('menuOptions', [...menuOptions, newOption])
              }}
              className={`mt-4 w-full px-3 py-2 text-sm rounded-lg border-2 border-dashed transition-colors ${
                isDark 
                  ? 'border-gray-500 hover:border-orange-400 text-gray-300 hover:text-orange-400' 
                  : 'border-gray-300 hover:border-orange-400 text-gray-600 hover:text-orange-600'
              }`}
            >
              + Adicionar Nova Opção
            </button>
            
            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                💡 <strong>Dica:</strong> Cada opção é um mini-node com sua própria ação. O usuário digita o número/letra para escolher.
              </p>
            </div>
          </div>
        </div>
      )

    case 'trigger-webhook':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>URL do Webhook *</label>
            <input
              type="url"
              value={config.webhookUrl || ''}
              onChange={(e) => updateConfig('webhookUrl', e.target.value)}
              placeholder="https://exemplo.com/webhook"
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Método HTTP</label>
            <select 
              value={config.method || 'POST'} 
              onChange={(e) => updateConfig('method', e.target.value)}
              className={inputClass}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
            </select>
          </div>
        </div>
      )

    // ============= ACTIONS =============
    case 'action-whatsapp-text':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Mensagem *</label>
            <textarea
              value={config.message || ''}
              onChange={(e) => updateConfig('message', e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={4}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Delay (segundos)</label>
            <input
              type="number"
              value={config.delay || 0}
              onChange={(e) => updateConfig('delay', parseInt(e.target.value))}
              min="0"
              max="300"
              className={inputClass}
            />
          </div>
        </div>
      )

    case 'action-fila-assign':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Fila *</label>
            <select 
              value={config.filaId || ''} 
              onChange={(e) => updateConfig('filaId', e.target.value)}
              className={inputClass}
            >
              <option value="">Selecione uma fila</option>
              {systemData.filas.map(fila => (
                <option key={fila.id} value={fila.id}>
                  {fila.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      )

    case 'action-contact-add-tag':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Tag *</label>
            <select 
              value={config.tagId || ''} 
              onChange={(e) => updateConfig('tagId', e.target.value)}
              className={inputClass}
            >
              <option value="">Selecione uma tag</option>
              {systemData.tags.map(tag => (
                <option key={tag.id} value={tag.id}>
                  {tag.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      )

    case 'action-whatsapp-list':
      const listOptions = config.listOptions || []
      
      return (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📱 Enviar Menu Lista WhatsApp
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Envia um menu interativo via WhatsApp com múltiplas opções clicáveis.
            </p>
          </div>
          
          <div>
            <label className={labelClass}>Título do Menu *</label>
            <input
              type="text"
              value={config.listTitle || ''}
              onChange={(e) => updateConfig('listTitle', e.target.value)}
              placeholder="Ex: Escolha uma opção"
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Descrição (opcional)</label>
            <textarea
              value={config.listDescription || ''}
              onChange={(e) => updateConfig('listDescription', e.target.value)}
              placeholder="Descrição do menu (aparece abaixo do título)"
              rows={2}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Texto do Botão</label>
            <input
              type="text"
              value={config.buttonText || ''}
              onChange={(e) => updateConfig('buttonText', e.target.value)}
              placeholder="Ex: Ver opções"
              className={inputClass}
            />
          </div>
          
          {/* Opções da Lista */}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📋 Opções do Menu
            </h4>
            
            <div className="space-y-3">
              {listOptions.map((option: any, index: number) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Opção {index + 1}: {option.title || 'Sem título'}
                    </span>
                    <div className="flex space-x-1">
                      {/* Mover para cima */}
                      {index > 0 && (
                        <button
                          onClick={() => {
                            const newOptions = [...listOptions]
                            ;[newOptions[index], newOptions[index - 1]] = [newOptions[index - 1], newOptions[index]]
                            updateConfig('listOptions', newOptions)
                          }}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-500' : 'hover:bg-gray-200'}`}
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                      )}
                      
                      {/* Mover para baixo */}
                      {index < listOptions.length - 1 && (
                        <button
                          onClick={() => {
                            const newOptions = [...listOptions]
                            ;[newOptions[index], newOptions[index + 1]] = [newOptions[index + 1], newOptions[index]]
                            updateConfig('listOptions', newOptions)
                          }}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-500' : 'hover:bg-gray-200'}`}
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                      )}
                      
                      {/* Remover */}
                      <button
                        onClick={() => {
                          const newOptions = listOptions.filter((_: any, i: number) => i !== index)
                          updateConfig('listOptions', newOptions)
                        }}
                        className={`p-1 rounded text-red-500 ${isDark ? 'hover:bg-gray-500' : 'hover:bg-gray-200'}`}
                        title="Remover opção"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  {/* Configuração da Opção */}
                  <div className="space-y-2">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Título da Opção *
                      </label>
                      <input
                        type="text"
                        value={option.title || ''}
                        onChange={(e) => {
                          const newOptions = [...listOptions]
                          newOptions[index] = { ...newOptions[index], title: e.target.value }
                          updateConfig('listOptions', newOptions)
                        }}
                        placeholder="Ex: Falar com atendente"
                        className={`w-full px-2 py-1 text-sm rounded border ${
                          isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Descrição (opcional)
                      </label>
                      <input
                        type="text"
                        value={option.description || ''}
                        onChange={(e) => {
                          const newOptions = [...listOptions]
                          newOptions[index] = { ...newOptions[index], description: e.target.value }
                          updateConfig('listOptions', newOptions)
                        }}
                        placeholder="Descrição da opção"
                        className={`w-full px-2 py-1 text-sm rounded border ${
                          isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        ID da Opção *
                      </label>
                      <input
                        type="text"
                        value={option.id || ''}
                        onChange={(e) => {
                          const newOptions = [...listOptions]
                          newOptions[index] = { ...newOptions[index], id: e.target.value }
                          updateConfig('listOptions', newOptions)
                        }}
                        placeholder="identificador-unico"
                        className={`w-full px-2 py-1 text-sm rounded border ${
                          isDark ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Usado para identificar qual opção o usuário selecionou
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Adicionar Nova Opção */}
            <button
              onClick={() => {
                const newOption = {
                  id: `opcao-${listOptions.length + 1}`,
                  title: '',
                  description: ''
                }
                updateConfig('listOptions', [...listOptions, newOption])
              }}
              className={`mt-4 w-full px-3 py-2 text-sm rounded-lg border-2 border-dashed transition-colors ${
                isDark 
                  ? 'border-gray-500 hover:border-green-400 text-gray-300 hover:text-green-400' 
                  : 'border-gray-300 hover:border-green-400 text-gray-600 hover:text-green-600'
              }`}
            >
              + Adicionar Nova Opção
            </button>
            
            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                💡 <strong>Dica:</strong> O WhatsApp exibe essas opções como botões clicáveis no chat.
              </p>
            </div>
          </div>
        </div>
      )

    // ============= DEFAULT =============
    default:
      return (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Configuração para este tipo de nó ainda não implementada.
            </p>
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Tipo: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{nodeType}</code>
            </p>
          </div>
        </div>
      )
  }
}
