'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, Mail, MessageSquare, Phone, Smartphone,
  Clock, Calendar, User, Users, AlertCircle,
  CheckCircle, XCircle, Info, Volume2, VolumeX
} from 'lucide-react'

interface NotificacoesTabProps {
  coluna: {
    id: string
    nome: string
    cor: string
  }
  theme: string
}

interface NotificationConfig {
  id: string
  tipo: 'email' | 'whatsapp' | 'push' | 'sms'
  evento: string
  ativo: boolean
  destinatarios: string[]
  configuracoes: {
    horario?: string
    frequencia?: string
    template?: string
  }
}

export default function NotificacoesTab({ coluna, theme }: NotificacoesTabProps) {
  const [notificacoes, setNotificacoes] = useState<NotificationConfig[]>([
    {
      id: '1',
      tipo: 'email',
      evento: 'Meta de vendas atingida',
      ativo: true,
      destinatarios: ['admin@empresa.com', 'gerente@empresa.com'],
      configuracoes: {
        template: 'meta_vendas'
      }
    },
    {
      id: '2',
      tipo: 'whatsapp',
      evento: 'Card parado há mais de 24h',
      ativo: true,
      destinatarios: ['+55119999999'],
      configuracoes: {
        horario: '09:00',
        frequencia: 'diaria'
      }
    },
    {
      id: '3',
      tipo: 'push',
      evento: 'Novo card adicionado',
      ativo: false,
      destinatarios: ['all'],
      configuracoes: {}
    }
  ])

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)

  const tiposNotificacao = [
    { id: 'email', label: 'Email', icon: Mail, cor: '#3B82F6' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, cor: '#22C55E' },
    { id: 'push', label: 'Push', icon: Smartphone, cor: '#8B5CF6' },
    { id: 'sms', label: 'SMS', icon: Phone, cor: '#F59E0B' }
  ]

  const eventos = [
    { id: 'meta_atingida', label: 'Meta atingida', icon: CheckCircle },
    { id: 'card_parado', label: 'Card parado', icon: Clock },
    { id: 'novo_card', label: 'Novo card', icon: AlertCircle },
    { id: 'prazo_proximo', label: 'Prazo próximo', icon: Calendar },
    { id: 'responsavel_atribuido', label: 'Responsável atribuído', icon: User }
  ]

  const toggleNotificacao = (id: string) => {
    setNotificacoes(notificacoes.map(n => 
      n.id === id ? { ...n, ativo: !n.ativo } : n
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header com Configurações Globais */}
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div 
              className="p-3 rounded-xl"
              style={{ 
                backgroundColor: `${coluna.cor}20`,
                color: coluna.cor 
              }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Bell className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Central de Notificações
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Configure alertas e avisos automáticos
              </p>
            </div>
          </div>

          {/* Sound Toggle */}
          <motion.button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-xl transition-all ${
              soundEnabled
                ? theme === 'dark'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-green-100 text-green-600'
                : theme === 'dark'
                  ? 'bg-slate-800 text-gray-500'
                  : 'bg-gray-100 text-gray-500'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Quick Settings */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            onClick={() => setEmailDigest(!emailDigest)}
            className={`p-4 rounded-xl border-2 transition-all ${
              emailDigest
                ? `border-2`
                : theme === 'dark'
                  ? 'border-slate-700 hover:border-slate-600'
                  : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{
              borderColor: emailDigest ? coluna.cor : undefined,
              backgroundColor: emailDigest ? `${coluna.cor}10` : undefined
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mail className="w-5 h-5 mb-2" style={{ color: emailDigest ? coluna.cor : undefined }} />
            <h4 className={`font-medium mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Resumo Diário
            </h4>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Receba um email com resumo das atividades
            </p>
            <div className={`mt-2 text-xs font-medium ${
              emailDigest ? 'text-green-500' : 'text-gray-400'
            }`}>
              {emailDigest ? '✓ Ativado' : 'Desativado'}
            </div>
          </motion.button>

          <motion.button
            className={`p-4 rounded-xl border-2 transition-all ${
              theme === 'dark'
                ? 'border-slate-700 hover:border-slate-600'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users className="w-5 h-5 mb-2" />
            <h4 className={`font-medium mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Gerenciar Destinatários
            </h4>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Configure quem recebe notificações
            </p>
            <div className="mt-2 text-xs font-medium" style={{ color: coluna.cor }}>
              5 destinatários →
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Tipos de Notificação */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiposNotificacao.map((tipo, index) => {
          const Icon = tipo.icon
          const count = notificacoes.filter(n => n.tipo === tipo.id && n.ativo).length
          
          return (
            <motion.div
              key={tipo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl text-center ${
                theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/80'
              } border ${
                theme === 'dark' ? 'border-slate-700/30' : 'border-gray-200/30'
              }`}
            >
              <div 
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ 
                  backgroundColor: `${tipo.cor}20`,
                  color: tipo.cor 
                }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h4 className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {tipo.label}
              </h4>
              <p className={`text-2xl font-bold mt-1`} style={{ color: tipo.cor }}>
                {count}
              </p>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                ativas
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Lista de Notificações Configuradas */}
      <div className="space-y-3">
        {notificacoes.map((notif, index) => {
          const tipoConfig = tiposNotificacao.find(t => t.id === notif.tipo)
          const TipoIcon = tipoConfig?.icon || Bell
          
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-5 rounded-2xl backdrop-blur-xl border ${
                theme === 'dark' 
                  ? 'bg-slate-900/50 border-slate-700/30' 
                  : 'bg-white/80 border-gray-200/30'
              }`}
              style={{
                borderLeft: `3px solid ${notif.ativo ? coluna.cor : '#94A3B8'}`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: notif.ativo ? `${tipoConfig?.cor}20` : '#94A3B820',
                      color: notif.ativo ? tipoConfig?.cor : '#94A3B8'
                    }}
                  >
                    <TipoIcon className="w-5 h-5" />
                  </div>
                  
                  <div>
                    <h4 className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {notif.evento}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
                      }`}>
                        {notif.tipo}
                      </span>
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        • {notif.destinatarios.length} destinatários
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <motion.button
                  onClick={() => toggleNotificacao(notif.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notif.ativo 
                      ? 'bg-green-500' 
                      : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className="absolute w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{ x: notif.ativo ? 25 : 2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    style={{ top: '0.125rem' }}
                  />
                </motion.button>
              </div>

              {/* Configurações Extras */}
              {notif.configuracoes.horario && (
                <div className={`mt-3 pt-3 border-t flex items-center gap-4 text-xs ${
                  theme === 'dark' ? 'border-slate-700/50 text-gray-400' : 'border-gray-200/50 text-gray-600'
                }`}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {notif.configuracoes.horario}
                  </span>
                  {notif.configuracoes.frequencia && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {notif.configuracoes.frequencia}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`p-4 rounded-xl flex items-center gap-3 ${
          theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'
        }`}
      >
        <Info className="w-5 h-5 text-blue-500" />
        <p className={`text-sm ${
          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
        }`}>
          💡 Dica: Configure horários específicos para evitar notificações fora do expediente
        </p>
      </motion.div>
    </div>
  )
}
