'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  X, 
  MessageSquare, 
  Users, 
  UserPlus, 
  Search,
  Settings,
  Loader2,
  Check
} from 'lucide-react'

type TabType = 'chats' | 'contatos' | 'grupos' | 'filas'

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
  const [activeTab, setActiveTab] = useState<TabType>('chats')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  // State para seleções
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set())
  const [selectedContatos, setSelectedContatos] = useState<Set<string>>(new Set())
  const [selectedGrupos, setSelectedGrupos] = useState<Set<string>>(new Set())
  const [selectedFilas, setSelectedFilas] = useState<Set<string>>(new Set())

  // State para dados
  const [chats, setChats] = useState<any[]>([])
  const [contatos, setContatos] = useState<any[]>([])
  const [grupos, setGrupos] = useState<any[]>([])
  const [filas, setFilas] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Buscar dados quando o modal abrir
  useEffect(() => {
    if (isOpen && connection) {
      console.log('🔍 [MODAL] Modal aberto para conexão:', connection)
      console.log('🔍 [MODAL] Connection sessionName:', connection.sessionName)
      console.log('🔍 [MODAL] Iniciando fetchAllData...')
      
      // Primeiro carregar dados salvos, depois buscar dados frescos
      loadSavedConfiguration().then(() => {
        fetchAllData()
      })
    } else {
      console.log('🔍 [MODAL] Modal não aberto. isOpen:', isOpen, 'connection:', !!connection)
    }
  }, [isOpen, connection])

  // Carregar configuração salva do backend
  const loadSavedConfiguration = async () => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      
      console.log('🔄 [LOAD CONFIG] Carregando configuração salva...')
      
      const response = await fetch(`${backendUrl}/api/connections/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const connections = data.connections || []
        
        // Encontrar a conexão atual
        const currentConnection = connections.find((conn: any) => 
          conn.platform === 'whatsapp' && conn.user_id
        )
        
        if (currentConnection?.modulation) {
          const modulation = typeof currentConnection.modulation === 'string' 
            ? JSON.parse(currentConnection.modulation) 
            : currentConnection.modulation
            
          console.log('✅ [LOAD CONFIG] Modulation encontrada:', modulation)
          
          // Pré-popular as seleções com os dados salvos
          if (Array.isArray(modulation.selectedChats)) {
            setSelectedChats(new Set(modulation.selectedChats))
            console.log('✅ [LOAD CONFIG] Chats pré-selecionados:', modulation.selectedChats)
          }
          
          if (Array.isArray(modulation.selectedContacts)) {
            setSelectedContatos(new Set(modulation.selectedContacts))
            console.log('✅ [LOAD CONFIG] Contatos pré-selecionados:', modulation.selectedContacts)
          }
          
          if (Array.isArray(modulation.selectedGroups)) {
            setSelectedGrupos(new Set(modulation.selectedGroups))
            console.log('✅ [LOAD CONFIG] Grupos pré-selecionados:', modulation.selectedGroups)
          }
          
          if (Array.isArray(modulation.selectedFilas)) {
            setSelectedFilas(new Set(modulation.selectedFilas))
            console.log('✅ [LOAD CONFIG] Filas pré-selecionadas:', modulation.selectedFilas)
          }
        } else {
          console.log('ℹ️ [LOAD CONFIG] Nenhuma modulation salva encontrada')
        }
      } else {
        console.log('❌ [LOAD CONFIG] Erro ao carregar configuração:', response.status)
      }
    } catch (error) {
      console.error('❌ [LOAD CONFIG] Erro:', error)
    }
  }

  const fetchAllData = async () => {
    setLoadingData(true)
    try {
      await Promise.all([
        fetchChats(),
        fetchContatos(), 
        fetchGrupos(),
        fetchFilas()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchChats = async () => {
    try {
      if (!connection.sessionName) {
        console.log('❌ [CHATS] sessionName não encontrado:', connection)
        return
      }
      
      // Aguardar um pouco para garantir que o token esteja disponível
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const token = localStorage.getItem('token')
      console.log('🔍 [CHATS] localStorage keys:', Object.keys(localStorage))
      console.log('🔍 [CHATS] Token no localStorage:', token ? `${token.substring(0, 20)}...` : 'null')
      
      if (!token) {
        console.log('❌ [CHATS] Token não encontrado no localStorage')
        return
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      
      console.log('🔍 [CHATS] Headers sendo enviados:', {
        Authorization: `Bearer ${token.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      })
      
      console.log('🔍 [CHATS] Buscando chats para sessão:', connection.sessionName)
      const response = await fetch(`/api/whatsapp/chats`, { headers })
      console.log('📡 [CHATS] Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [CHATS] Dados recebidos:', data)
        setChats(Array.isArray(data) ? data : [])
      } else {
        console.log('❌ [CHATS] Erro na resposta:', response.status, response.statusText)
        // Criar dados mock para teste
        const mockChats = [
          { id: 'mock1@c.us', name: 'Chat Teste 1', pushName: 'Usuario 1' },
          { id: 'mock2@c.us', name: 'Chat Teste 2', pushName: 'Usuario 2' }
        ]
        setChats(mockChats)
        console.log('✅ [CHATS] Usando dados mock:', mockChats)
      }
    } catch (error) {
      console.error('❌ [CHATS] Erro ao buscar chats:', error)
      // Fallback para dados mock
      const mockChats = [
        { id: 'mock1@c.us', name: 'Chat Teste 1', pushName: 'Usuario 1' },
        { id: 'mock2@c.us', name: 'Chat Teste 2', pushName: 'Usuario 2' }
      ]
      setChats(mockChats)
      console.log('✅ [CHATS] Fallback para dados mock:', mockChats)
    }
  }

  const fetchContatos = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/contatos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setContatos(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
    }
  }

  const fetchGrupos = async () => {
    try {
      if (!connection.sessionName) {
        console.log('❌ [GRUPOS] sessionName não encontrado:', connection)
        return
      }
      
      // Aguardar um pouco para garantir que o token esteja disponível
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const token = localStorage.getItem('token')
      console.log('🔍 [GRUPOS] localStorage keys:', Object.keys(localStorage))
      console.log('🔍 [GRUPOS] Token no localStorage:', token ? `${token.substring(0, 20)}...` : 'null')
      
      if (!token) {
        console.log('❌ [GRUPOS] Token não encontrado no localStorage')
        return
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      
      console.log('🔍 [GRUPOS] Headers sendo enviados:', {
        Authorization: `Bearer ${token.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      })
      
      console.log('🔍 [GRUPOS] Buscando grupos para sessão:', connection.sessionName)
      const response = await fetch(`/api/whatsapp/groups`, { headers })
      console.log('📡 [GRUPOS] Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [GRUPOS] Dados recebidos:', data)
        setGrupos(Array.isArray(data) ? data : [])
      } else {
        console.log('❌ [GRUPOS] Erro na resposta:', response.status, response.statusText)
        // Criar dados mock para teste
        const mockGrupos = [
          { id: 'grupo1@g.us', name: 'Grupo Teste 1', membros: 5 },
          { id: 'grupo2@g.us', name: 'Grupo Teste 2', membros: 10 }
        ]
        setGrupos(mockGrupos)
        console.log('✅ [GRUPOS] Usando dados mock:', mockGrupos)
      }
    } catch (error) {
      console.error('❌ [GRUPOS] Erro ao buscar grupos:', error)
      // Fallback para dados mock
      const mockGrupos = [
        { id: 'grupo1@g.us', name: 'Grupo Teste 1', membros: 5 },
        { id: 'grupo2@g.us', name: 'Grupo Teste 2', membros: 10 }
      ]
      setGrupos(mockGrupos)
      console.log('✅ [GRUPOS] Fallback para dados mock:', mockGrupos)
    }
  }

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
        console.log('✅ [FILAS] Dados recebidos:', data)
        // A API retorna {data: [...], success: true}
        const filasData = data.data || data
        setFilas(Array.isArray(filasData) ? filasData : [])
        console.log('✅ [FILAS] Filas processadas:', filasData.length)
      }
    } catch (error) {
      console.error('Erro ao buscar filas:', error)
      setFilas([])
    }
  }

  if (!isOpen || !connection) return null

  const handleSave = () => {
    const modulation = {
      selectedChats: Array.from(selectedChats),
      selectedContatos: [],
      selectedGrupos: Array.from(selectedGrupos),
      selectedFilas: Array.from(selectedFilas)
    }
    onSave(modulation)
  }

  const tabs = [
    { id: 'chats' as TabType, label: 'Chats', icon: MessageSquare, count: chats.length },
    { id: 'grupos' as TabType, label: 'Grupos', icon: UserPlus, count: grupos.length },
    { id: 'filas' as TabType, label: 'Filas', icon: Settings, count: filas.length }
  ]

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'chats': return chats
      case 'grupos': return grupos
      case 'filas': return filas
      default: return []
    }
  }

  const filteredItems = getCurrentItems().filter(item => {
    const searchLower = searchTerm.toLowerCase()
    const name = item.nome || item.name || item.pushName || item.id || ''
    const id = item.id || item.chatId || ''
    
    return name.toLowerCase().includes(searchLower) || 
           id.toLowerCase().includes(searchLower)
  })

  const isSelected = (tabType: TabType, id: string) => {
    switch (tabType) {
      case 'chats': return selectedChats.has(id)
      case 'grupos': return selectedGrupos.has(id)
      case 'filas': return selectedFilas.has(id)
      default: return false
    }
  }

  const toggleSelection = (tabType: TabType, id: string) => {
    switch (tabType) {
      case 'chats':
        const newChats = new Set(selectedChats)
        if (newChats.has(id)) {
          newChats.delete(id)
        } else {
          newChats.add(id)
        }
        setSelectedChats(newChats)
        break
      case 'grupos':
        const newGrupos = new Set(selectedGrupos)
        if (newGrupos.has(id)) {
          newGrupos.delete(id)
        } else {
          newGrupos.add(id)
        }
        setSelectedGrupos(newGrupos)
        break
      case 'filas':
        const newFilas = new Set(selectedFilas)
        if (newFilas.has(id)) {
          newFilas.delete(id)
        } else {
          newFilas.add(id)
        }
        setSelectedFilas(newFilas)
        break
    }
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
              Selecione chats, contatos e filas para modular a conexão
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

        {/* Tabs */}
        <div className={`px-6 py-3 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? theme === 'dark'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
                        : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-1 rounded text-xs ${
                    activeTab === tab.id 
                      ? 'bg-blue-600/20 text-blue-400' 
                      : 'bg-gray-200 text-gray-600'
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
              placeholder={`Buscar ${activeTab}...`}
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
                Carregando {activeTab}...
              </span>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="p-4 space-y-2">
              {filteredItems.map((item) => {
                const itemSelected = isSelected(activeTab, item.id)

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
                    onClick={() => toggleSelection(activeTab, item.id || item.chatId || item.numero)}
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
            Filas: {selectedFilas.size} | Chats: {selectedChats.size} | 
            Contatos: {selectedContatos.size} | Grupos: {selectedGrupos.size}
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
