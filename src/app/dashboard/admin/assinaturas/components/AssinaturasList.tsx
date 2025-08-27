'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, Star, Crown, Building, Calendar, DollarSign, 
  Play, Pause, Edit, XCircle, CheckCircle, 
  AlertCircle, Clock
} from 'lucide-react'
import { AssinaturaDisplay } from '../page'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AssinaturasListProps {
  assinaturas: AssinaturaDisplay[]
  onUpdateAssinatura: (id: string, updates: Partial<AssinaturaDisplay>) => void
  onDeleteAssinatura: (id: string) => void
  onEditAssinatura: (assinatura: AssinaturaDisplay) => void
}

export default function AssinaturasList({ assinaturas, onUpdateAssinatura, onDeleteAssinatura, onEditAssinatura }: AssinaturasListProps) {

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'basico': return Star
      case 'premium': return Crown
      case 'enterprise': return Building
      case 'custom': return CreditCard
      default: return CreditCard
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-700 border-green-200'
      case 'expirada': return 'bg-red-100 text-red-700 border-red-200'
      case 'cancelada': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'pendente': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'suspensa': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa': return CheckCircle
      case 'expirada': return XCircle
      case 'cancelada': return XCircle
      case 'pendente': return Clock
      case 'suspensa': return AlertCircle
      default: return CheckCircle
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'basico': return 'bg-blue-100 text-blue-700'
      case 'premium': return 'bg-purple-100 text-purple-700'
      case 'enterprise': return 'bg-indigo-100 text-indigo-700'
      case 'custom': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPeriodoLabel = (periodo: string) => {
    switch (periodo) {
      case 'mensal': return 'Mensal'
      case 'trimestral': return 'Trimestral'
      case 'semestral': return 'Semestral'
      case 'anual': return 'Anual'
      default: return periodo
    }
  }

  const getFormaPagamentoLabel = (forma: string) => {
    switch (forma) {
      case 'pix': return 'PIX'
      case 'cartao': return 'Cartão'
      case 'boleto': return 'Boleto'
      case 'transferencia': return 'Transferência'
      default: return forma
    }
  }

  const getDiasParaVencer = (dataVencimento: Date) => {
    const hoje = new Date()
    const diffTime = dataVencimento.getTime() - hoje.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const toggleAssinaturaStatus = (assinatura: AssinaturaDisplay) => {
    const newStatus = assinatura.status === 'ativa' ? 'suspensa' : 'ativa'
    onUpdateAssinatura(assinatura.id, { status: newStatus })
  }

  if (assinaturas.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma assinatura encontrada</h3>
        <p className="text-gray-500">Crie uma nova assinatura para começar.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <AnimatePresence>
        {assinaturas.map((assinatura, index) => {
          const Icon = getIconByTipo(assinatura.plano.tipo)
          const StatusIcon = getStatusIcon(assinatura.status)

          return (
            <motion.div
              key={assinatura.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              {/* Header com status */}
              <div className={`h-2 ${
                assinatura.status === 'ativa' ? 'bg-green-500' :
                assinatura.status === 'expirada' ? 'bg-red-500' :
                assinatura.status === 'suspensa' ? 'bg-orange-500' :
                'bg-gray-400'
              }`} />

              <div className="p-6">
                {/* Cliente e Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      assinatura.status === 'ativa' ? 'bg-green-50' :
                      assinatura.status === 'expirada' ? 'bg-red-50' :
                      assinatura.status === 'suspensa' ? 'bg-orange-50' :
                      'bg-gray-50'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        assinatura.status === 'ativa' ? 'text-green-600' :
                        assinatura.status === 'expirada' ? 'text-red-600' :
                        assinatura.status === 'suspensa' ? 'text-orange-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {assinatura.contato.nome}
                      </h3>
                      <p className="text-sm text-gray-500">{assinatura.plano.nome}</p>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assinatura.status)}`}>
                    <StatusIcon className="w-3 h-3 inline mr-1" />
                    {assinatura.status.charAt(0).toUpperCase() + assinatura.status.slice(1)}
                  </span>
                </div>

                {/* Valor e Período */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    R$ {assinatura.plano.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-500">
                    por {assinatura.plano.periodo}
                  </div>
                </div>

                {/* Informações */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Vencimento:</span>
                    <span className="font-medium text-gray-900">
                      {format(assinatura.dataVencimento, 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pagamento:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {assinatura.formaPagamento}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Início:</span>
                    <span className="font-medium text-gray-900">
                      {format(assinatura.dataInicio, 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleAssinaturaStatus(assinatura)}
                    className={`flex-1 p-2 rounded-lg transition-colors text-sm font-medium ${
                      assinatura.status === 'ativa' 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {assinatura.status === 'ativa' ? (
                      <>
                        <Pause className="w-4 h-4 inline mr-1" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 inline mr-1" />
                        Ativar
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEditAssinatura(assinatura)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDeleteAssinatura(assinatura.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    title="Cancelar"
                  >
                    <XCircle className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
