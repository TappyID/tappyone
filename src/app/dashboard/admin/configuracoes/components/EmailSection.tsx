'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail,
  Server,
  Key,
  Send,
  Eye,
  EyeOff,
  TestTube,
  CheckCircle,
  AlertCircle,
  Palette,
  FileText,
  Settings
} from 'lucide-react'

interface EmailSectionProps {
  onConfigChange: () => void
}

export default function EmailSection({ onConfigChange }: EmailSectionProps) {
  const [config, setConfig] = useState({
    // Configurações SMTP
    smtp: {
      servidor: 'smtp.gmail.com',
      porta: 587,
      seguranca: 'tls', // tls, ssl, none
      usuario: '',
      senha: '',
      remetente: 'noreply@tappyone.com',
      nomeRemetente: 'TappyOne CRM'
    },
    
    // Templates
    templates: {
      bemVindo: {
        ativo: true,
        assunto: 'Bem-vindo ao TappyOne!',
        template: 'moderno'
      },
      resetSenha: {
        ativo: true,
        assunto: 'Redefinir sua senha',
        template: 'simples'
      },
      novoAtendimento: {
        ativo: true,
        assunto: 'Novo atendimento recebido',
        template: 'notificacao'
      },
      relatorioSemanal: {
        ativo: false,
        assunto: 'Relatório semanal - TappyOne',
        template: 'relatorio'
      }
    },
    
    // Configurações Avançadas
    configuracoes: {
      tentativasReenvio: 3,
      intervaloReenvio: 5, // minutos
      limitePorHora: 100,
      assinaturaHtml: true,
      trackingAbertura: true,
      trackingClique: true,
      antiSpam: true
    },
    
    // Filas de Email
    filas: {
      prioridade: {
        alta: 'imediato',
        media: '5min',
        baixa: '30min'
      },
      processamento: 'automatico' // automatico, manual
    }
  })

  const [showPassword, setShowPassword] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

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

  const testConnection = async () => {
    setIsTestingConnection(true)
    setTestResult(null)
    
    // Simular teste de conexão
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simular resultado baseado nas configurações
    const hasValidConfig = config.smtp.servidor && config.smtp.usuario && config.smtp.senha
    setTestResult(hasValidConfig ? 'success' : 'error')
    setIsTestingConnection(false)
  }

  const sendTestEmail = async () => {
    // Simular envio de email de teste
    await testConnection()
  }

  const templateOptions = [
    { value: 'moderno', label: 'Moderno', description: 'Design limpo e contemporâneo' },
    { value: 'classico', label: 'Clássico', description: 'Layout tradicional e formal' },
    { value: 'simples', label: 'Simples', description: 'Minimalista, apenas texto' },
    { value: 'notificacao', label: 'Notificação', description: 'Para alertas e avisos' },
    { value: 'relatorio', label: 'Relatório', description: 'Para dados e estatísticas' }
  ]

  return (
    <div className="space-y-8">
      {/* Configurações SMTP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Server className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Configurações SMTP</h3>
            <p className="text-gray-600">Configure o servidor de email para envio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Servidor SMTP *
            </label>
            <input
              type="text"
              value={config.smtp.servidor}
              onChange={(e) => handleConfigChange('smtp.servidor', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="smtp.gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Porta
            </label>
            <input
              type="number"
              value={config.smtp.porta}
              onChange={(e) => handleConfigChange('smtp.porta', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="587"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Segurança
            </label>
            <select
              value={config.smtp.seguranca}
              onChange={(e) => handleConfigChange('smtp.seguranca', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="none">Nenhuma</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Usuário *
            </label>
            <input
              type="email"
              value={config.smtp.usuario}
              onChange={(e) => handleConfigChange('smtp.usuario', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu-email@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Senha *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={config.smtp.senha}
                onChange={(e) => handleConfigChange('smtp.senha', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Remetente
            </label>
            <input
              type="email"
              value={config.smtp.remetente}
              onChange={(e) => handleConfigChange('smtp.remetente', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="noreply@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Remetente
            </label>
            <input
              type="text"
              value={config.smtp.nomeRemetente}
              onChange={(e) => handleConfigChange('smtp.nomeRemetente', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Sua Empresa"
            />
          </div>
        </div>

        {/* Teste de Conexão */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Testar Configurações</h4>
              <p className="text-sm text-gray-600">Verifique se as configurações estão corretas</p>
            </div>
            
            <div className="flex items-center gap-3">
              {testResult && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  testResult === 'success' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {testResult === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {testResult === 'success' ? 'Conexão OK' : 'Erro na conexão'}
                  </span>
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={testConnection}
                disabled={isTestingConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Templates de Email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Palette className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Templates de Email</h3>
            <p className="text-gray-600">Configure os templates para diferentes tipos de email</p>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(config.templates).map(([key, template]) => (
            <div key={key} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </h4>
                    <p className="text-sm text-gray-600">Template para {key}</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={template.ativo}
                    onChange={(e) => handleConfigChange(`templates.${key}.ativo`, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {template.ativo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assunto
                    </label>
                    <input
                      type="text"
                      value={template.assunto}
                      onChange={(e) => handleConfigChange(`templates.${key}.assunto`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Template
                    </label>
                    <select
                      value={template.template}
                      onChange={(e) => handleConfigChange(`templates.${key}.template`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      {templateOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Preview de Template */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Preview do Template</h4>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={sendTestEmail}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Enviar Teste
            </motion.button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Selecione um template para visualizar o preview</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Configurações Avançadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <Settings className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Configurações Avançadas</h3>
            <p className="text-gray-600">Configurações de entrega, filas e monitoramento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configurações de Entrega */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Entrega</h4>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tentativas de Reenvio
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.configuracoes.tentativasReenvio}
                onChange={(e) => handleConfigChange('configuracoes.tentativasReenvio', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Intervalo de Reenvio (minutos)
              </label>
              <input
                type="number"
                min="1"
                value={config.configuracoes.intervaloReenvio}
                onChange={(e) => handleConfigChange('configuracoes.intervaloReenvio', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Limite por Hora
              </label>
              <input
                type="number"
                min="1"
                value={config.configuracoes.limitePorHora}
                onChange={(e) => handleConfigChange('configuracoes.limitePorHora', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Configurações de Monitoramento */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Monitoramento</h4>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.configuracoes.assinaturaHtml}
                onChange={(e) => handleConfigChange('configuracoes.assinaturaHtml', e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Assinatura HTML</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.configuracoes.trackingAbertura}
                onChange={(e) => handleConfigChange('configuracoes.trackingAbertura', e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Tracking de Abertura</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.configuracoes.trackingClique}
                onChange={(e) => handleConfigChange('configuracoes.trackingClique', e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Tracking de Clique</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.configuracoes.antiSpam}
                onChange={(e) => handleConfigChange('configuracoes.antiSpam', e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Proteção Anti-Spam</span>
            </label>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Processamento de Filas
              </label>
              <select
                value={config.filas.processamento}
                onChange={(e) => handleConfigChange('filas.processamento', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              >
                <option value="automatico">Automático</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
