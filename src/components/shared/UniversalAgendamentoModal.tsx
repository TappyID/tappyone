'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  Users,
  Coffee,
  Bell,
  FileText,
  Save,
  UserPlus,
  Edit,
  Share,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock4
} from 'lucide-react'

interface Contato {
  id: string
  nome: string
  numeroTelefone?: string
  email?: string
  empresa?: string
  avatar?: string
}

interface UniversalAgendamentoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (agendamento: AgendamentoData) => Promise<void>
  contatos?: Contato[]
  selectedDate?: Date
  chatId?: string
  contactData?: {
    id?: string
    nome?: string
    telefone?: string
    email?: string
    empresa?: string
    cpf?: string
    cnpj?: string
    cep?: string
    endereco?: string
    bairro?: string
    rua?: string
    numero?: string
    estado?: string
    cidade?: string
    pais?: string
    tags?: string[]
  }
  editData?: AgendamentoData & { id: string }
  mode?: 'create' | 'edit' | 'view'
  onStatusChange?: (status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido') => Promise<void>
  onEdit?: () => void
  onDelete?: () => Promise<void>
  onShare?: () => void
}

interface AgendamentoData {
  titulo: string
  descricao?: string
  data: string
  hora_inicio: string
  hora_fim: string
  tipo: 'reuniao' | 'ligacao' | 'video' | 'presencial' | 'coffee'
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido'
  prioridade: 'baixa' | 'media' | 'alta'
  contato: {
    id: string
    nome: string
    telefone?: string
    email?: string
    empresa?: string
    cpf?: string
    cnpj?: string
    cep?: string
    endereco?: string
    bairro?: string
    rua?: string
    numero?: string
    estado?: string
    cidade?: string
    pais?: string
    tags?: string[]
  }
  local?: string
  link_video?: string
  observacoes?: string
  lembrete?: number
  cor?: string
}

// Funções de utilitários fora do componente
const cleanPhone = (phone: string) => {
  return phone?.replace('@c.us', '').replace(/\D/g, '') || ''
}

const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

const formatCPF = (cpf: string) => {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
}

const formatCNPJ = (cnpj: string) => {
  const cleaned = cnpj.replace(/\D/g, '')
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5')
}

const formatCEP = (cep: string) => {
  const cleaned = cep.replace(/\D/g, '')
  return cleaned.replace(/(\d{5})(\d{0,3})/, '$1-$2')
}

export default function UniversalAgendamentoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  contatos = [],
  selectedDate,
  chatId,
  contactData,
  editData,
  mode = 'create',
  onStatusChange,
  onEdit,
  onDelete,
  onShare
}: UniversalAgendamentoModalProps) {
  const [loading, setLoading] = useState(false)
  const [showNewContactForm, setShowNewContactForm] = useState(false)
  
  const [formData, setFormData] = useState<AgendamentoData>({
    titulo: '',
    descricao: '',
    data: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    hora_inicio: '',
    hora_fim: '',
    tipo: 'reuniao',
    status: 'agendado',
    prioridade: 'media',
    contato: {
      id: '',
      nome: contactData?.nome || '',
      telefone: contactData?.telefone ? cleanPhone(contactData.telefone) : '',
      email: contactData?.email || '',
      empresa: contactData?.empresa || '',
      cpf: contactData?.cpf || '',
      cnpj: contactData?.cnpj || '',
      cep: contactData?.cep || '',
      endereco: contactData?.endereco || '',
      bairro: contactData?.bairro || '',
      rua: contactData?.rua || '',
      numero: contactData?.numero || '',
      estado: contactData?.estado || '',
      cidade: contactData?.cidade || '',
      pais: contactData?.pais || 'Brasil',
      tags: contactData?.tags || []
    },
    local: '',
    link_video: '',
    observacoes: '',
    lembrete: 15,
    cor: '#3b82f6'
  })

  // Reset form quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Modo edição - preencher com dados existentes
        console.log('🔍 EditData recebido:', editData)
        setFormData(editData)
      } else {
        // Modo criação - reset form
        setFormData({
          titulo: '',
          descricao: '',
          data: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
          hora_inicio: '',
          hora_fim: '',
          tipo: 'reuniao',
          status: 'agendado',
          prioridade: 'media',
          contato: {
            id: contactData?.id || '',
            nome: contactData?.nome || '',
            telefone: contactData?.telefone ? cleanPhone(contactData.telefone) : '',
            email: contactData?.email || '',
            empresa: contactData?.empresa || '',
            cpf: contactData?.cpf || '',
            cnpj: contactData?.cnpj || '',
            cep: contactData?.cep || '',
            endereco: contactData?.endereco || '',
            bairro: contactData?.bairro || '',
            rua: contactData?.rua || '',
            numero: contactData?.numero || '',
            estado: contactData?.estado || '',
            cidade: contactData?.cidade || '',
            pais: contactData?.pais || 'Brasil',
            tags: contactData?.tags || []
          },
          local: '',
          link_video: '',
          observacoes: '',
          lembrete: 15,
          cor: '#3b82f6'
        })
      }
    }
  }, [isOpen, selectedDate, contactData, editData])

  const tiposAgendamento = [
    { value: 'reuniao', label: 'Reunião', icon: Users, color: '#3b82f6' },
    { value: 'ligacao', label: 'Ligação', icon: Phone, color: '#ef4444' },
    { value: 'video', label: 'Videochamada', icon: Video, color: '#10b981' },
    { value: 'presencial', label: 'Presencial', icon: MapPin, color: '#8b5cf6' },
    { value: 'coffee', label: 'Coffee Meeting', icon: Coffee, color: '#f59e0b' }
  ]

  const prioridades = [
    { value: 'baixa', label: 'Baixa', color: '#10b981' },
    { value: 'media', label: 'Média', color: '#f59e0b' },
    { value: 'alta', label: 'Alta', color: '#ef4444' }
  ]

  const lembretes = [
    { value: 0, label: 'Sem lembrete' },
    { value: 5, label: '5 minutos antes' },
    { value: 15, label: '15 minutos antes' },
    { value: 30, label: '30 minutos antes' },
    { value: 60, label: '1 hora antes' },
    { value: 1440, label: '1 dia antes' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar horários
      if (formData.hora_inicio >= formData.hora_fim) {
        alert('A hora de fim deve ser posterior à hora de início')
        setLoading(false)
        return
      }

      // Log dos dados para debug
      console.log('📝 Dados do formulário:', formData)
      
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função para buscar endereço por CEP
  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            contato: {
              ...prev.contato,
              rua: data.logradouro || '',
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              estado: data.uf || '',
              pais: 'Brasil'
            }
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

  const handleContatoSelect = (contato: Contato) => {
    setFormData(prev => ({
      ...prev,
      contato: {
        id: contato.id,
        nome: contato.nome,
        telefone: cleanPhone(contato.numeroTelefone || ''),
        email: contato.email || '',
        empresa: contato.empresa || '',
        cpf: '',
        cnpj: '',
        cep: '',
        endereco: '',
        bairro: '',
        rua: '',
        numero: '',
        estado: '',
        cidade: '',
        pais: 'Brasil',
        tags: []
      }
    }))
    setShowNewContactForm(false)
  }

  const tipoSelecionado = tiposAgendamento.find(t => t.value === formData.tipo)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {mode === 'edit' ? 'Editar Agendamento' : 'Novo Agendamento'}
                    </h2>
                    <p className="text-gray-600">Preencha os dados do agendamento</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informações Básicas */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#305e73]" />
                      Informações Básicas
                    </h3>

                    {/* Título */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título do Agendamento
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        placeholder="Ex: Reunião de projeto"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                      />
                    </div>

                    {/* Tipo */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Agendamento
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {tiposAgendamento.map((tipo) => {
                          const IconComponent = tipo.icon
                          return (
                            <motion.button
                              key={tipo.value}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setFormData({ ...formData, tipo: tipo.value as any, cor: tipo.color })}
                              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                formData.tipo === tipo.value
                                  ? 'border-[#305e73] bg-[#305e73]/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <IconComponent className={`w-4 h-4 ${
                                formData.tipo === tipo.value ? 'text-[#305e73]' : 'text-gray-600'
                              }`} />
                              <span className={`text-sm font-medium ${
                                formData.tipo === tipo.value ? 'text-[#305e73]' : 'text-gray-700'
                              }`}>
                                {tipo.label}
                              </span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Prioridade */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioridade
                      </label>
                      <select
                        value={formData.prioridade}
                        onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                      >
                        {prioridades.map(prioridade => (
                          <option key={prioridade.value} value={prioridade.value}>
                            {prioridade.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição (Opcional)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Detalhes sobre o agendamento..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Data e Horário */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#305e73]" />
                      Data e Horário
                    </h3>

                    {/* Data */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.data}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                      />
                    </div>

                    {/* Horários */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hora Início
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.hora_inicio}
                          onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hora Fim
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.hora_fim}
                          onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Lembrete */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Bell className="w-4 h-4 inline mr-1" />
                        Lembrete
                      </label>
                      <select
                        value={formData.lembrete}
                        onChange={(e) => setFormData({ ...formData, lembrete: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                      >
                        {lembretes.map(lembrete => (
                          <option key={lembrete.value} value={lembrete.value}>
                            {lembrete.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Local (se presencial) */}
                    {formData.tipo === 'presencial' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Local
                        </label>
                        <input
                          type="text"
                          value={formData.local}
                          onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                          placeholder="Endereço do encontro"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Link (se video) */}
                    {formData.tipo === 'video' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Video className="w-4 h-4 inline mr-1" />
                          Link da Videochamada
                        </label>
                        <input
                          type="url"
                          value={formData.link_video}
                          onChange={(e) => setFormData({ ...formData, link_video: e.target.value })}
                          placeholder="https://meet.google.com/..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção de Contato */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#305e73]" />
                  {contactData ? 'Contato Selecionado' : 'Selecionar Contato'}
                </h3>

                {/* Se há contactData (chat/kanban) OU é modo edição com dados do contato, mostrar formulário direto */}
                {contactData || (mode === 'edit' && editData?.contato?.id) || (mode === 'view' && editData?.contato?.id) ? (
                  <div className="space-y-4">
                    {/* Card do contato selecionado */}
                    <div className="p-4 bg-gray-50 rounded-xl border-2 border-[#305e73] bg-[#305e73]/5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#305e73] rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {(contactData?.nome || editData?.contato?.nome)?.charAt(0).toUpperCase() || 'C'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{contactData?.nome || editData?.contato?.nome}</p>
                          {(contactData?.telefone || editData?.contato?.telefone) && (
                            <p className="text-sm text-gray-600">{contactData?.telefone || editData?.contato?.telefone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Formulário expandido com campos do contato */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-medium text-gray-900">Dados do Contato</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.contato.nome}
                            onChange={(e) => setFormData({
                              ...formData,
                              contato: { ...formData.contato, nome: e.target.value }
                            })}
                            placeholder="Nome do contato"
                            disabled={true}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            value={formatPhone(formData.contato.telefone || '')}
                            onChange={(e) => {
                              const onlyNumbers = e.target.value.replace(/\D/g, '')
                              setFormData(prev => ({
                                ...prev,
                                contato: { ...prev.contato, telefone: onlyNumbers }
                              }))
                            }}
                            placeholder="(11) 99999-9999"
                            disabled={true}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.contato.email}
                            onChange={(e) => setFormData({
                              ...formData,
                              contato: { ...formData.contato, email: e.target.value }
                            })}
                            placeholder="contato@email.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Empresa
                          </label>
                          <input
                            type="text"
                            value={formData.contato.empresa}
                            onChange={(e) => setFormData({
                              ...formData,
                              contato: { ...formData.contato, empresa: e.target.value }
                            })}
                            placeholder="Nome da empresa"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CPF
                          </label>
                          <input
                            type="text"
                            value={formatCPF(formData.contato.cpf || '')}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\D/g, '')
                              if (cleaned.length <= 11) {
                                setFormData(prev => ({
                                  ...prev,
                                  contato: { ...prev.contato, cpf: cleaned }
                                }))
                              }
                            }}
                            placeholder="000.000.000-00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CNPJ
                          </label>
                          <input
                            type="text"
                            value={formatCNPJ(formData.contato.cnpj || '')}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\D/g, '')
                              if (cleaned.length <= 14) {
                                setFormData(prev => ({
                                  ...prev,
                                  contato: { ...prev.contato, cnpj: cleaned }
                                }))
                              }
                            }}
                            placeholder="00.000.000/0000-00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Campos de Endereço */}
                      <div className="space-y-4 mt-4">
                        <h4 className="text-md font-medium text-gray-800 border-b pb-2">Endereço</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CEP
                            </label>
                            <input
                              type="text"
                              value={formatCEP(formData.contato.cep || '')}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/\D/g, '')
                                if (cleaned.length <= 8) {
                                  setFormData(prev => ({
                                    ...prev,
                                    contato: { ...prev.contato, cep: cleaned }
                                  }))
                                  // Buscar endereço quando CEP estiver completo
                                  if (cleaned.length === 8) {
                                    fetchAddressByCEP(cleaned)
                                  }
                                }
                              }}
                              placeholder="00000-000"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rua
                            </label>
                            <input
                              type="text"
                              value={formData.contato.rua}
                              onChange={(e) => setFormData({
                                ...formData,
                                contato: { ...formData.contato, rua: e.target.value }
                              })}
                              placeholder="Nome da rua"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Número
                            </label>
                            <input
                              type="text"
                              value={formData.contato.numero}
                              onChange={(e) => setFormData({
                                ...formData,
                                contato: { ...formData.contato, numero: e.target.value }
                              })}
                              placeholder="123"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bairro
                            </label>
                            <input
                              type="text"
                              value={formData.contato.bairro}
                              onChange={(e) => setFormData({
                                ...formData,
                                contato: { ...formData.contato, bairro: e.target.value }
                              })}
                              placeholder="Nome do bairro"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cidade
                            </label>
                            <input
                              type="text"
                              value={formData.contato.cidade}
                              onChange={(e) => setFormData({
                                ...formData,
                                contato: { ...formData.contato, cidade: e.target.value }
                              })}
                              placeholder="Nome da cidade"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Estado
                            </label>
                            <input
                              type="text"
                              value={formData.contato.estado}
                              onChange={(e) => setFormData({
                                ...formData,
                                contato: { ...formData.contato, estado: e.target.value }
                              })}
                              placeholder="SP"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              País
                            </label>
                            <input
                              type="text"
                              value={formData.contato.pais}
                              onChange={(e) => setFormData({
                                ...formData,
                                contato: { ...formData.contato, pais: e.target.value }
                              })}
                              placeholder="Brasil"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  !showNewContactForm ? (
                  <div className="space-y-4">
                    {/* Lista de contatos existentes */}
                    {contatos && contatos.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {contatos.map((contato) => (
                          <motion.button
                            key={contato.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleContatoSelect(contato)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                              formData.contato.id === contato.id
                                ? 'border-[#305e73] bg-[#305e73]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="w-10 h-10 bg-[#305e73] rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {contato.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{contato.nome}</p>
                              {contato.numeroTelefone && (
                                <p className="text-sm text-gray-600">{contato.numeroTelefone}</p>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Mensagem quando não há contatos */}
                    {contatos && contatos.length === 0 && !contactData && (
                      <div className="text-center py-4 text-gray-500">
                        <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Nenhum contato encontrado</p>
                        <p className="text-sm">Crie um novo contato abaixo</p>
                      </div>
                    )}

                    {/* Botão para novo contato - oculto quando contato pré-selecionado */}
                    {!contactData && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowNewContactForm(true)}
                        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#305e73] hover:bg-[#305e73]/5 transition-all"
                      >
                        <UserPlus className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600 font-medium">Novo Contato</span>
                      </motion.button>
                    )}
                  </div>
                  ) : (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Dados do Contato</h4>
                      <button
                        type="button"
                        onClick={() => setShowNewContactForm(false)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Voltar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.contato.nome}
                          onChange={(e) => setFormData({
                            ...formData,
                            contato: { ...formData.contato, nome: e.target.value }
                          })}
                          placeholder="Nome do contato"
                          disabled={!!contactData && !showNewContactForm}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                            contactData && !showNewContactForm ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          value={formData.contato.telefone}
                          onChange={(e) => setFormData({
                            ...formData,
                            contato: { ...formData.contato, telefone: e.target.value }
                          })}
                          placeholder="(11) 99999-9999"
                          disabled={!!contactData && !showNewContactForm}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                            contactData && !showNewContactForm ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.contato.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            contato: { ...formData.contato, email: e.target.value }
                          })}
                          placeholder="contato@email.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          value={formData.contato.empresa}
                          onChange={(e) => setFormData({
                            ...formData,
                            contato: { ...formData.contato, empresa: e.target.value }
                          })}
                          placeholder="Nome da empresa"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CNPJ
                        </label>
                        <input
                          type="text"
                          value={formData.contato.cnpj}
                          onChange={(e) => setFormData({
                            ...formData,
                            contato: { ...formData.contato, cnpj: e.target.value }
                          })}
                          placeholder="00.000.000/0000-00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Campos de Endereço */}
                    <div className="space-y-4 mt-4">
                      <h4 className="text-md font-medium text-gray-800 border-b pb-2">Endereço</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rua
                          </label>
                          <input
                            type="text"
                            value={formData.contato.rua}
                            onChange={(e) => setFormData({
                              ...formData,
                              contato: { ...formData.contato, rua: e.target.value }
                            })}
                            placeholder="Nome da rua"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número
                          </label>
                          <input
                            type="text"
                            value={formData.contato.numero}
                            onChange={(e) => setFormData({
                              ...formData,
                              contato: { ...formData.contato, numero: e.target.value }
                            })}
                            placeholder="123"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bairro
                          </label>
                          <input
                            type="text"
                            value={formData.contato.bairro}
                            onChange={(e) => setFormData({
                              ...formData,
                              contato: { ...formData.contato, bairro: e.target.value }
                            })}
                            placeholder="Nome do bairro"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={formData.contato.cidade}
                            onChange={(e) => setFormData({
                              ...formData,
                              contato: { ...formData.contato, cidade: e.target.value }
                            })}
                            placeholder="Nome da cidade"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                          </label>
                          <input
                            type="text"
                            value={formData.contato.estado}
                            onChange={(e) => setFormData({
                              ...formData,
                              contato: { ...formData.contato, estado: e.target.value }
                            })}
                            placeholder="SP"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            País
                          </label>
                          <input
                            type="text"
                            value={formData.contato.pais}
                            onChange={(e) => setFormData({
                              ...formData,
                              contato: { ...formData.contato, pais: e.target.value }
                            })}
                            placeholder="Brasil"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  )
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Observações Adicionais
                </label>
                <textarea
                  rows={3}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Anotações importantes sobre o agendamento..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent resize-none"
                />
              </div>

              {/* Footer com botões - Diferentes para cada modo */}
              {mode === 'view' ? (
                <>
                  {/* Botões de alteração de status */}
                  <div className="pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Alterar Status</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        onClick={() => onStatusChange?.('agendado')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-all"
                      >
                        <Clock4 className="w-4 h-4" />
                        Agendado
                      </button>
                      <button
                        onClick={() => onStatusChange?.('confirmado')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirmado
                      </button>
                      <button
                        onClick={() => onStatusChange?.('cancelado')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancelado
                      </button>
                      <button
                        onClick={() => onStatusChange?.('concluido')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Concluído
                      </button>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-2">
                      <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={onShare}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                      >
                        <Share className="w-4 h-4" />
                        Compartilhar
                      </button>
                      <button
                        onClick={onDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all"
                    >
                      Fechar
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {mode === 'edit' ? 'Atualizar Agendamento' : 'Criar Agendamento'}
                  </motion.button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export type { AgendamentoData, Contato, UniversalAgendamentoModalProps }
