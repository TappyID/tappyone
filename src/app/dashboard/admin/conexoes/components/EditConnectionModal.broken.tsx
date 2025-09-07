'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  X, 
  MessageSquare, 
  Users, 
  UserPlus, 
  Search,
  Check,
  Loader2,
  Settings
} from 'lucide-react'

interface EditConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  connection: any
}

type TabType = 'chats' | 'contatos' | 'grupos' | 'filas'

interface WhatsAppItem {
  id: string
  nome: string
  numero?: string
  avatar?: string
  membros?: number
}

interface Fila {
  id: string
  nome: string
  cor: string
  ativa: boolean
  descricao?: string
}

export function EditConnectionModal({ isOpen, onClose, connection }: EditConnectionModalProps) {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('chats')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Estados para dados da WAHA API
  const [chats, setChats] = useState<WhatsAppItem[]>([])
  const [contatos, setContatos] = useState<WhatsAppItem[]>([])
  const [grupos, setGrupos] = useState<WhatsAppItem[]>([])
  
  // Estados para dados do Backend
  const [filas, setFilas] = useState<Fila[]>([])
  
  // Estados de seleção
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set())
  const [selectedContatos, setSelectedContatos] = useState<Set<string>>(new Set())
  const [selectedGrupos, setSelectedGrupos] = useState<Set<string>>(new Set())
  const [selectedFilas, setSelectedFilas] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen && connection) {
      loadData()
    }
  }, [isOpen, connection])

  const loadData = async () => {
    if (!connection?.sessionName) return
    
    setLoading(true)
    try {
      // Carregar dados da WAHA API e Backend
      const [chatsRes, contatosRes, gruposRes, filasRes] = await Promise.allSettled([
        fetch(`/api/whatsapp/chats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/whatsapp/contacts`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/whatsapp/groups`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/filas', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ])

      // Processar chats
      if (chatsRes.status === 'fulfilled' && chatsRes.value.ok) {
        const chatsData = await chatsRes.value.json()
        const formattedChats = Array.isArray(chatsData) ? chatsData.map((chat: any) => ({
          id: chat.id,
          nome: chat.name || chat.id.replace('@c.us', ''),
          numero: chat.id.replace('@c.us', '')
        })) : []
        setChats(formattedChats)
      }

      // Processar contatos
      if (contatosRes.status === 'fulfilled' && contatosRes.value.ok) {
        const contatosData = await contatosRes.value.json()
        const formattedContatos = Array.isArray(contatosData) ? contatosData.map((contact: any) => ({
          id: contact.id,
          nome: contact.name || contact.id.replace('@c.us', ''),
          numero: contact.id.replace('@c.us', '')
        })) : []
        setContatos(formattedContatos)
      }

      // Processar grupos
      if (gruposRes.status === 'fulfilled' && gruposRes.value.ok) {
        const gruposData = await gruposRes.value.json()
        const formattedGrupos = Array.isArray(gruposData) ? gruposData.map((group: any) => ({
          id: group.id,
          nome: group.name || group.subject,
          membros: group.participants?.length || 0
        })) : []
        setGrupos(formattedGrupos)
      }

      // Processar filas
      if (filasRes.status === 'fulfilled' && filasRes.value.ok) {
        const filasData = await filasRes.value.json()
        if (filasData.success && Array.isArray(filasData.data)) {
          setFilas(filasData.data)
        }
      }

      // Carregar seleções existentes se houver
      if (connection.modulation) {
        const mod = connection.modulation
        setSelectedChats(new Set(mod.selectedChats || []))
        setSelectedContatos(new Set(mod.selectedContacts || []))
        setSelectedGrupos(new Set(mod.selectedGroups || []))
        setSelectedFilas(new Set(mod.selectedFilas || []))
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      const modulation = {
        selectedChats: Array.from(selectedChats),
        selectedContacts: Array.from(selectedContatos),
        selectedGroups: Array.from(selectedGrupos),
        selectedFilas: Array.from(selectedFilas)
      }

      const response = await fetch(`/api/connections/whatsapp/${connection.sessionName}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ modulation })
      })

      if (response.ok) {
        onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar modulação:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (type: TabType, id: string) => {
    const setters = {
      chats: setSelectedChats,
      contatos: setSelectedContatos,
      grupos: setSelectedGrupos,
      filas: setSelectedFilas
    }
    
    const getters = {
      chats: selectedChats,
      contatos: selectedContatos,
      grupos: selectedGrupos,
      filas: selectedFilas
    }

    const current = getters[type]
    const setter = setters[type]
    const newSet = new Set(current)
    
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    
    setter(newSet)
  }

  const getFilteredItems = () => {
    const items = {
      chats,
      contatos,
      grupos,
      filas
    }[activeTab]

    if (!searchTerm) return items
    
    return items.filter(item => {
      const searchLower = searchTerm.toLowerCase()
      return item.nome?.toLowerCase().includes(searchLower) ||
             ('numero' in item && item.numero?.toLowerCase().includes(searchLower))
    })
  }

  const getSelectedCount = (type: TabType) => {
    const counts = {
      chats: selectedChats.size,
      contatos: selectedContatos.size,
      grupos: selectedGrupos.size,
      filas: selectedFilas.size
    }
    return counts[type]
  }

  const isSelected = (type: TabType, id: string) => {
    const selections = {
      chats: selectedChats,
      contatos: selectedContatos,
      grupos: selectedGrupos,
      filas: selectedFilas
    }
    return selections[type].has(id)
  }

  if (!connection) return null

  const tabs = [
    { id: 'chats' as TabType, label: 'Chats', icon: MessageSquare, count: chats.length },
    { id: 'contatos' as TabType, label: 'Contatos', icon: Users, count: contatos.length },
    { id: 'grupos' as TabType, label: 'Grupos', icon: UserPlus, count: grupos.length },
    { id: 'filas' as TabType, label: 'Filas', icon: Settings, count: filas.length }
  ]

  const filteredItems = getFilteredItems()

  if (!isOpen) return null

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
            className={`p-2 rounded-lg ${
              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
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
                      onClick={() => setActiveTab(tab.id as any)}
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
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {tab.count}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Search */}
            <div className="px-6 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"

        {/* Items List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="p-2">
              {filteredItems.map((item) => {
                const itemSelected = isSelected(activeTab, item.id)

                return (
                  <motion.div
                    key={item.id}
                    layout
                    className={`p-3 mb-2 rounded-lg border-2 cursor-pointer transition-all ${
                      itemSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => toggleSelection(activeTab, item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.nome}</h4>
                        {'numero' in item && item.numero && (
                          <p className="text-sm text-gray-500">{item.numero}</p>
                        )}
                        {'membros' in item && item.membros && (
                          <p className="text-xs text-gray-400">{item.membros} membros</p>
                        )}
                        {'descricao' in item && item.descricao && (
                          <p className="text-xs text-gray-400">{item.descricao}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {'cor' in item && item.cor && (
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: item.cor }}
                          />
                        )}
                        {itemSelected && <Check className="w-5 h-5 text-blue-500" />}
                      </div>
                    </div>
                  </motion.div>
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
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.05 }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium"
            >
              Salvar Configurações
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  )
}
