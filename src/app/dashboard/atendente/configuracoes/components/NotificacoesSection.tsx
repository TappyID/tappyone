'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

interface NotificacoesSectionProps {
  onConfigChange: () => void
}

export default function NotificacoesSection({ onConfigChange }: NotificacoesSectionProps) {
  const [config, setConfig] = useState({
    notificacoesAtivas: true,
    somAtivo: true,
    volumeNotificacao: 70,
    horarioSilencioso: {
      ativo: false,
      inicio: '22:00',
      fim: '08:00'
    },
    tiposNotificacao: {
      novoAtendimento: { ativo: true, som: true, push: true, email: false },
      mensagemRecebida: { ativo: true, som: true, push: true, email: false },
      atendimentoTransferido: { ativo: true, som: false, push: true, email: true },
      novoUsuario: { ativo: true, som: false, push: false, email: true },
      tarefaVencida: { ativo: true, som: true, push: true, email: true },
      erroSistema: { ativo: true, som: true, push: true, email: true }
    },
    pushNotifications: {
      ativo: true,
      navegador: true,
      mobile: true,
      desktop: true
    }
  })

  const [previewSound, setPreviewSound] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleConfigChange = (path: string, value: any) => {
    const keys = path.split('.')
    setConfig(prev => {
      const newConfig = { ...prev }
      let current = newConfig as any
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newConfig
    })
    onConfigChange()
  }

  const testNotification = (tipo: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Teste de Notificação', {
        body: `Esta é uma notificação de teste para: ${tipo}`,
        icon: '/favicon.ico'
      })
    }
  }

  const notificationTypes = [
    {
      key: 'novoAtendimento',
      label: 'Novo Atendimento',
      description: 'Quando um novo atendimento é iniciado',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      key: 'mensagemRecebida',
      label: 'Mensagem Recebida',
      description: 'Nova mensagem em atendimento ativo',
      icon: Mail,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      key: 'atendimentoTransferido',
      label: 'Atendimento Transferido',
      description: 'Quando um atendimento é transferido para você',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      key: 'novoUsuario',
      label: 'Novo Usuário',
      description: 'Quando um novo usuário é cadastrado',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      key: 'tarefaVencida',
      label: 'Tarefa Vencida',
      description: 'Quando uma tarefa atinge o prazo',
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      key: 'erroSistema',
      label: 'Erro do Sistema',
      description: 'Quando ocorre um erro crítico',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Configurações Gerais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Configurações Gerais</h3>
            <p className="text-gray-600">Configure o comportamento básico das notificações</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Notificações Ativas</h4>
                  <p className="text-sm text-gray-600">Ativar/desativar todas as notificações</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificacoesAtivas}
                  onChange={(e) => handleConfigChange('notificacoesAtivas', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                {config.somAtivo ? <Volume2 className="w-5 h-5 text-green-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                <div>
                  <h4 className="font-semibold text-gray-900">Som das Notificações</h4>
                  <p className="text-sm text-gray-600">Reproduzir sons para notificações</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.somAtivo}
                  onChange={(e) => handleConfigChange('somAtivo', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Volume2 className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Volume</h4>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.volumeNotificacao}
                  onChange={(e) => handleConfigChange('volumeNotificacao', parseInt(e.target.value))}
                  className="flex-1"
                  disabled={!config.somAtivo}
                />
                <span className="text-sm font-medium w-12 text-center">
                  {config.volumeNotificacao}%
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Horário Silencioso</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.horarioSilencioso.ativo}
                    onChange={(e) => handleConfigChange('horarioSilencioso.ativo', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              {config.horarioSilencioso.ativo && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Início</label>
                    <input
                      type="time"
                      value={config.horarioSilencioso.inicio}
                      onChange={(e) => handleConfigChange('horarioSilencioso.inicio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Fim</label>
                    <input
                      type="time"
                      value={config.horarioSilencioso.fim}
                      onChange={(e) => handleConfigChange('horarioSilencioso.fim', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tipos de Notificação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <Settings className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Tipos de Notificação</h3>
            <p className="text-gray-600">Configure cada tipo de notificação individualmente</p>
          </div>
        </div>

        <div className="space-y-4">
          {notificationTypes.map((type) => {
            const typeConfig = config.tiposNotificacao[type.key as keyof typeof config.tiposNotificacao]
            const Icon = type.icon

            return (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${type.bgColor}`}>
                      <Icon className={`w-5 h-5 ${type.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{type.label}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => testNotification(type.label)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Testar
                  </motion.button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={typeConfig.ativo}
                      onChange={(e) => handleConfigChange(`tiposNotificacao.${type.key}.ativo`, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Ativo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={typeConfig.som}
                      onChange={(e) => handleConfigChange(`tiposNotificacao.${type.key}.som`, e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      disabled={!typeConfig.ativo || !config.somAtivo}
                    />
                    <span className="text-sm font-medium text-gray-700">Som</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={typeConfig.push}
                      onChange={(e) => handleConfigChange(`tiposNotificacao.${type.key}.push`, e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      disabled={!typeConfig.ativo}
                    />
                    <span className="text-sm font-medium text-gray-700">Push</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={typeConfig.email}
                      onChange={(e) => handleConfigChange(`tiposNotificacao.${type.key}.email`, e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      disabled={!typeConfig.ativo}
                    />
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </label>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Push Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 rounded-xl">
            <Smartphone className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Push Notifications</h3>
            <p className="text-gray-600">Configure notificações push para diferentes dispositivos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Navegador</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.pushNotifications.navegador}
                  onChange={(e) => handleConfigChange('pushNotifications.navegador', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">Notificações no navegador web</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Mobile</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.pushNotifications.mobile}
                  onChange={(e) => handleConfigChange('pushNotifications.mobile', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">Notificações em dispositivos móveis</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Desktop</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.pushNotifications.desktop}
                  onChange={(e) => handleConfigChange('pushNotifications.desktop', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">Notificações no sistema operacional</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
