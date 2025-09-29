'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  X, 
  MessageSquare, 
  MessageCircle,
  Users, 
  UserPlus, 
  Search,
  Settings,
  Loader2,
  Check
} from 'lucide-react'

type TabType = 'filas'

interface Connection {
  id: string
  sessionName: string
  platform: string
  status: string
}

interface EditConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  connection: Connection | null
  onSave: (modulation: any) => void
}

export function EditConnectionModal({
  isOpen,
  onClose,
  connection,
  onSave
}: EditConnectionModalProps) {
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  // State para seleções
  const [selectedFilas, setSelectedFilas] = useState<Set<string>>(new Set())
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set())
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  
  // State para tab ativa
  const [activeTab, setActiveTab] = useState<TabType>('filas')
  
  // State para nome da conexão
  const [connectionName, setConnectionName] = useState('')

  // State para dados (filas, chats e groups)
  const [filas, setFilas] = useState<any[]>([])
  const [chats, setChats] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Limpar estado quando modal abrir ou fechar
  useEffect(() => {
    if (isOpen && connection) {
      // Limpar estado anterior primeiro
      setSelectedFilas(new Set())
      setSelectedChats(new Set())
      setSelectedGroups(new Set())
      setConnectionName('')
      setFilas([])
      setChats([])
      setGroups([])
      setSearchTerm('')
      
      
      // Primeiro carregar dados salvos, depois buscar dados frescos
      loadSavedConfiguration().then(() => {
        Promise.all([
          fetchFilas(),
          fetchChatsAndGroups()
        ])
      })
    } else if (!isOpen) {
      // Limpar estado quando modal fechar
      setSelectedFilas(new Set())
      setSelectedChats(new Set())
      setSelectedGroups(new Set())
      setConnectionName('')
      setFilas([])
      setChats([])
      setGroups([])
      setSearchTerm('')
      setLoadingData(false)
      setLoading(false)
    }
  }, [isOpen, connection])

  // Carregar configuração salva dos dados da conexão
  const loadSavedConfiguration = async () => {
    try {
      
      // Usar dados que já estão na conexão
      if ((connection as any).modulation) {
        const modulation = typeof (connection as any).modulation === 'string' 
          ? JSON.parse((connection as any).modulation) 
          : (connection as any).modulation
          
        
        // Pré-popular as seleções com os dados salvos (apenas filas)
        if (Array.isArray(modulation.selectedFilas)) {
          setSelectedFilas(new Set(modulation.selectedFilas))
        } else {
          setSelectedFilas(new Set())
        }
        
        // Carregar nome da conexão se existir
        if (modulation.connectionName) {
          setConnectionName(modulation.connectionName)
        } else {
          // Nome padrão baseado no push_name da WAHA ou sessionName
          setConnectionName((connection as any).sessionData?.push_name || (connection as any).displayName || connection.sessionName || 'Nova Conexão')
        }
      } else {
        setSelectedFilas(new Set())
        // Nome padrão baseado no push_name da WAHA ou sessionName
        setConnectionName((connection as any).sessionData?.push_name || (connection as any).displayName || connection.sessionName || 'Nova Conexão')
      }
    } catch (error) {
      console.error('❌ [LOAD CONFIG] Erro interno:', error)
      // Nome padrão em caso de erro
      setConnectionName((connection as any).displayName || connection.sessionName || 'Nova Conexão')
    }
  }
  // Função removida - não precisamos mais buscar chats



  // Função removida - não precisamos mais buscar grupos

  const fetchFilas = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/filas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        // A API retorna {data: [...], success: true}
        const filasData = data.data || data
        
        // Os atendentes já vêm na resposta da API /api/filas
        
        const filasComAtendentes = filasData
          .filter((fila: any) => fila.nome && fila.nome.trim() !== '' && fila.ativa) // Filtrar filas vazias e inativas
          .map((fila: any) => {
            return {
              ...fila,
              atendentes: Array.isArray(fila.atendentes) ? fila.atendentes : []
            }
          })
        
        setFilas(Array.isArray(filasComAtendentes) ? filasComAtendentes : [])
      }
    } catch (error) {
      console.error('Erro ao buscar filas:', error)
      setFilas([])
    } finally {
      setLoadingData(false)
    }
  }

  // Buscar chats e groups da WAHA
  const fetchChatsAndGroups = async () => {
    if (!connection?.sessionName) return

    try {
      const sessionName = connection.sessionName
      
      // Buscar chats da WAHA - endpoint correto
      const chatsResponse = await fetch(`/api/whatsapp/chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json()
        console.log('🔍 [WAHA] Dados recebidos:', chatsData)
        
        const chatsList = Array.isArray(chatsData) ? chatsData : chatsData.data || []
        
        // Separar chats individuais e grupos
        const individualChats = chatsList.filter((chat: any) => !chat.id?.includes('@g.us'))
        const groupChats = chatsList.filter((chat: any) => chat.id?.includes('@g.us'))
        
        console.log('📱 [WAHA] Chats individuais:', individualChats.length)
        console.log('👥 [WAHA] Grupos:', groupChats.length)
        
        setChats(individualChats)
        setGroups(groupChats)
      } else {
        console.error('❌ [WAHA] Erro na resposta:', chatsResponse.status)
        setChats([])
        setGroups([])
      }
    } catch (error) {
      console.error('❌ [WAHA] Erro ao buscar chats e grupos:', error)
      setChats([])
      setGroups([])
    }
  }

  if (!isOpen || !connection) return null

  const handleSave = () => {
    const modulation = {
      selectedFilas: Array.from(selectedFilas),
      selectedChats: Array.from(selectedChats),
      selectedGroups: Array.from(selectedGroups),
      connectionName: connectionName.trim() || connection?.sessionName || 'Nova Conexão',
      // Dados dos chats e grupos para referência
      chatsData: chats.filter(chat => selectedChats.has(chat.id)),
      groupsData: groups.filter(group => selectedGroups.has(group.id))
    }
    
    console.log('💾 [SAVE] Salvando configuração:', {
      filas: modulation.selectedFilas.length,
      chats: modulation.selectedChats.length,
      groups: modulation.selectedGroups.length,
      connectionName: modulation.connectionName
    })
    
    onSave(modulation)
  }

  const tabs = [
    { id: 'filas' as TabType, label: 'Filas', icon: Settings, count: filas.length }
  ]

  const getCurrentItems = () => {
    return filas
  }

  const filteredItems = getCurrentItems().filter(item => {
    const searchLower = searchTerm.toLowerCase()
    const name = item.nome || item.name || item.pushName || item.id || ''
    const id = item.id || item.chatId || ''
    
    return name.toLowerCase().includes(searchLower) || 
           id.toLowerCase().includes(searchLower)
  })

  const isSelected = (id: string) => {
    return selectedFilas.has(id)
  }

  const toggleSelection = (id: string) => {
    const newFilas = new Set(selectedFilas)
    if (newFilas.has(id)) {
      newFilas.delete(id)
    } else {
      newFilas.add(id)
    }
    setSelectedFilas(newFilas)
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Configurar Conexão
            </h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Selecione as filas para vincular à conexão WhatsApp
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-opacity-10 ${
              theme === 'dark' ? 'hover:bg-white' : 'hover:bg-black'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campo Nome da Conexão */}
        <div className={`px-6 py-4 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Nome da Conexão
            </label>
            <input
              type="text"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              placeholder="Digite um nome para identificar esta conexão"
              className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className={`px-6 py-3 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    isActive
                      ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search */}
        <div className={`px-6 py-4 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Buscar ${activeTab === 'filas' ? 'filas' : activeTab === 'chats' ? 'chats' : 'grupos'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto max-h-96">
          {loadingData ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Carregando {activeTab === 'filas' ? 'filas' : activeTab === 'chats' ? 'chats' : 'grupos'}...
              </span>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="p-4 space-y-2">
              {filteredItems.map((item) => {
                const itemSelected = isSelected(item.id)

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      itemSelected 
                        ? theme === 'dark'
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-blue-500 bg-blue-50'
                        : theme === 'dark'
                          ? 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => toggleSelection(item.id || item.chatId || item.numero)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.nome || item.name || item.id}
                        </h4>
                        {item.numero && (
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.numero}
                          </p>
                        )}
                        {item.membros && (
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {item.membros} membros
                          </p>
                        )}
                        {item.descricao && (
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {item.descricao}
                          </p>
                        )}
                        {item.atendentes && item.atendentes.length > 0 && (
                          <div className="mt-2">
                            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Atendentes ({item.atendentes.length}):
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.atendentes.slice(0, 3).map((atendente: any, index: number) => (
                                <span
                                  key={atendente.id || index}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    theme === 'dark' 
                                      ? 'bg-blue-900/30 text-blue-300' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {atendente.usuario?.nome || atendente.usuario?.email || 'Sem nome'}
                                </span>
                              ))}
                              {item.atendentes.length > 3 && (
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  theme === 'dark' 
                                    ? 'bg-gray-700 text-gray-300' 
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  +{item.atendentes.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.cor && (
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: item.cor }}
                          />
                        )}
                        {itemSelected && <Check className="w-5 h-5 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p>Nenhum item encontrado</p>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-between items-center ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Filas selecionadas: {selectedFilas.size} de {filas.length}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
