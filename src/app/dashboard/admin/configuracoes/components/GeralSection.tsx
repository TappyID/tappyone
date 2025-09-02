'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  Languages,
  DollarSign,
  Users,
  Calendar,
  Upload,
  Image as ImageIcon,
  Save,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

interface GeralSectionProps {
  onConfigChange: () => void
}

export default function GeralSection({ onConfigChange }: GeralSectionProps) {
  const [config, setConfig] = useState({
    // Informações da Empresa
    nomeEmpresa: 'TappyOne CRM',
    descricaoEmpresa: 'Plataforma avançada de gestão de relacionamento com clientes',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    telefone: '(11) 99999-9999',
    email: 'contato@tappyone.com',
    website: 'https://tappyone.com',
    
    // Configurações Regionais
    timezone: 'America/Sao_Paulo',
    idioma: 'pt-BR',
    moeda: 'BRL',
    formatoData: 'DD/MM/YYYY',
    formatoHora: '24h',
    
    // Configurações da Plataforma
    nomeAplicacao: 'TappyOne',
    versao: '2.1.0',
    ambiente: 'producao',
    debugMode: false,
    manutencao: false,
    
    // Limites e Quotas
    maxUsuarios: 1000,
    maxArmazenamento: 100, // GB
    maxUploadSize: 50, // MB
    
    // Logos e Imagens
    logoUrl: '',
    faviconUrl: '',
    logoLoginUrl: '',
    backgroundLoginUrl: ''
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    onConfigChange()
  }

  const handleLogoUpload = (field: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      handleConfigChange(field, e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const timezones = [
    { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
    { value: 'America/New_York', label: 'Nova York (UTC-5)' },
    { value: 'Europe/London', label: 'Londres (UTC+0)' },
    { value: 'Asia/Tokyo', label: 'Tóquio (UTC+9)' }
  ]

  const idiomas = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Español' },
    { value: 'fr-FR', label: 'Français' }
  ]

  const moedas = [
    { value: 'BRL', label: 'Real (R$)' },
    { value: 'USD', label: 'Dólar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'Libra (£)' }
  ]

  return (
    <div className="space-y-8">
      {/* Informações da Empresa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Informações da Empresa</h3>
            <p className="text-gray-600">Configure os dados básicos da sua empresa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome da Empresa *
            </label>
            <input
              type="text"
              value={config.nomeEmpresa}
              onChange={(e) => handleConfigChange('nomeEmpresa', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite o nome da empresa"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CNPJ
            </label>
            <input
              type="text"
              value={config.cnpj}
              onChange={(e) => handleConfigChange('cnpj', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição da Empresa
            </label>
            <textarea
              value={config.descricaoEmpresa}
              onChange={(e) => handleConfigChange('descricaoEmpresa', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva sua empresa..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Endereço
            </label>
            <input
              type="text"
              value={config.endereco}
              onChange={(e) => handleConfigChange('endereco', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rua, número, bairro"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cidade / Estado
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={config.cidade}
                onChange={(e) => handleConfigChange('cidade', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cidade"
              />
              <input
                type="text"
                value={config.estado}
                onChange={(e) => handleConfigChange('estado', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="UF"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Telefone
            </label>
            <input
              type="tel"
              value={config.telefone}
              onChange={(e) => handleConfigChange('telefone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => handleConfigChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="contato@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              Website
            </label>
            <input
              type="url"
              value={config.website}
              onChange={(e) => handleConfigChange('website', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CEP
            </label>
            <input
              type="text"
              value={config.cep}
              onChange={(e) => handleConfigChange('cep', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="00000-000"
            />
          </div>
        </div>
      </motion.div>

      {/* Configurações Regionais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <Globe className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Configurações Regionais</h3>
            <p className="text-gray-600">Defina timezone, idioma e formatos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Timezone
            </label>
            <select
              value={config.timezone}
              onChange={(e) => handleConfigChange('timezone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Languages className="w-4 h-4 inline mr-2" />
              Idioma
            </label>
            <select
              value={config.idioma}
              onChange={(e) => handleConfigChange('idioma', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {idiomas.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Moeda
            </label>
            <select
              value={config.moeda}
              onChange={(e) => handleConfigChange('moeda', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {moedas.map(currency => (
                <option key={currency.value} value={currency.value}>{currency.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Formato de Data
            </label>
            <select
              value={config.formatoData}
              onChange={(e) => handleConfigChange('formatoData', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Formato de Hora
            </label>
            <select
              value={config.formatoHora}
              onChange={(e) => handleConfigChange('formatoHora', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="24h">24 horas (14:30)</option>
              <option value="12h">12 horas (2:30 PM)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Logos e Imagens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl">
            <ImageIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Logos e Imagens</h3>
            <p className="text-gray-600">Configure as imagens da sua marca</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'logoUrl', label: 'Logo Principal', description: 'Logo usado no sistema (recomendado: 200x60px)' },
            { key: 'faviconUrl', label: 'Favicon', description: 'Ícone do navegador (recomendado: 32x32px)' },
            { key: 'logoLoginUrl', label: 'Logo do Login', description: 'Logo da página de login (recomendado: 300x100px)' },
            { key: 'backgroundLoginUrl', label: 'Background Login', description: 'Imagem de fundo do login (recomendado: 1920x1080px)' }
          ].map((item) => (
            <div key={item.key} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {item.label}
                </label>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-400 transition-colors">
                {config[item.key as keyof typeof config] ? (
                  <div className="space-y-3">
                    <img
                      src={config[item.key as keyof typeof config] as string}
                      alt={item.label}
                      className="max-h-20 mx-auto rounded-lg"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleConfigChange(item.key, '')}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Remover
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Clique para enviar</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleLogoUpload(item.key, file)
                      }}
                      className="hidden"
                      id={`upload-${item.key}`}
                    />
                    <label
                      htmlFor={`upload-${item.key}`}
                      className="cursor-pointer px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 inline-block"
                    >
                      Selecionar Arquivo
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Configurações Avançadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Configurações Avançadas</h3>
              <p className="text-gray-600">Limites, quotas e configurações técnicas</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 flex items-center gap-2"
          >
            {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAdvanced ? 'Ocultar' : 'Mostrar'}
          </motion.button>
        </div>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome da Aplicação
              </label>
              <input
                type="text"
                value={config.nomeAplicacao}
                onChange={(e) => handleConfigChange('nomeAplicacao', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Versão
              </label>
              <input
                type="text"
                value={config.versao}
                onChange={(e) => handleConfigChange('versao', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ambiente
              </label>
              <select
                value={config.ambiente}
                onChange={(e) => handleConfigChange('ambiente', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="desenvolvimento">Desenvolvimento</option>
                <option value="homologacao">Homologação</option>
                <option value="producao">Produção</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Máximo de Usuários
              </label>
              <input
                type="number"
                value={config.maxUsuarios}
                onChange={(e) => handleConfigChange('maxUsuarios', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Armazenamento Máximo (GB)
              </label>
              <input
                type="number"
                value={config.maxArmazenamento}
                onChange={(e) => handleConfigChange('maxArmazenamento', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tamanho Máximo de Upload (MB)
              </label>
              <input
                type="number"
                value={config.maxUploadSize}
                onChange={(e) => handleConfigChange('maxUploadSize', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.debugMode}
                    onChange={(e) => handleConfigChange('debugMode', e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Modo Debug</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.manutencao}
                    onChange={(e) => handleConfigChange('manutencao', e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Modo Manutenção</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
