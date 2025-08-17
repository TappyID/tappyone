'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette,
  Type,
  Monitor,
  Sun,
  Moon,
  Smartphone,
  Tablet,
  Eye,
  Sliders,
  Sparkles,
  Download,
  RotateCcw,
  Zap
} from 'lucide-react'

interface TemaSectionProps {
  onConfigChange: () => void
}

interface ColorPalette {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

const predefinedPalettes: ColorPalette[] = [
  {
    name: 'TappyOne (Padrão)',
    primary: '#273155',
    secondary: '#305e73',
    accent: '#3a6d84',
    background: '#f8fafc',
    text: '#1f2937'
  },
  {
    name: 'Ocean Blue',
    primary: '#0ea5e9',
    secondary: '#0284c7',
    accent: '#0369a1',
    background: '#f0f9ff',
    text: '#0c4a6e'
  },
  {
    name: 'Forest Green',
    primary: '#059669',
    secondary: '#047857',
    accent: '#065f46',
    background: '#f0fdf4',
    text: '#064e3b'
  },
  {
    name: 'Royal Purple',
    primary: '#7c3aed',
    secondary: '#6d28d9',
    accent: '#5b21b6',
    background: '#faf5ff',
    text: '#581c87'
  },
  {
    name: 'Dark Mode',
    primary: '#374151',
    secondary: '#4b5563',
    accent: '#6b7280',
    background: '#111827',
    text: '#f9fafb'
  }
]

const fontFamilies = [
  { name: 'Inter (Padrão)', value: 'Inter, sans-serif', preview: 'Aa' },
  { name: 'Roboto', value: 'Roboto, sans-serif', preview: 'Aa' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif', preview: 'Aa' },
  { name: 'Poppins', value: 'Poppins, sans-serif', preview: 'Aa' }
]

export default function TemaSection({ onConfigChange }: TemaSectionProps) {
  const [config, setConfig] = useState({
    paleta: 'TappyOne (Padrão)',
    corPrimaria: '#273155',
    corSecundaria: '#305e73',
    corAccent: '#3a6d84',
    corBackground: '#f8fafc',
    corTexto: '#1f2937',
    fontePrimaria: 'Inter, sans-serif',
    tamanhoFonteBase: 16,
    alturaLinha: 1.5,
    tema: 'light',
    borderRadius: 12,
    espacamento: 'normal',
    animacoes: true,
    sombras: true,
    estiloButton: 'rounded',
    cssCustom: ''
  })

  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    onConfigChange()
  }

  const applyPalette = (palette: ColorPalette) => {
    setConfig(prev => ({
      ...prev,
      paleta: palette.name,
      corPrimaria: palette.primary,
      corSecundaria: palette.secondary,
      corAccent: palette.accent,
      corBackground: palette.background,
      corTexto: palette.text
    }))
    onConfigChange()
  }

  const exportTheme = () => {
    const theme = { name: 'Custom Theme', timestamp: new Date().toISOString(), config }
    const dataStr = JSON.stringify(theme, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tema-personalizado.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Preview do Tema</h3>
              <p className="text-gray-600">Visualize as mudanças em tempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
            {[
              { mode: 'desktop', icon: Monitor },
              { mode: 'tablet', icon: Tablet },
              { mode: 'mobile', icon: Smartphone }
            ].map(({ mode, icon: Icon }) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05 }}
                onClick={() => setPreviewMode(mode as any)}
                className={`p-2 rounded-lg transition-colors ${
                  previewMode === mode ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Preview Frame */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <motion.div
            initial={false}
            animate={{
              width: previewMode === 'desktop' ? '100%' : previewMode === 'tablet' ? '768px' : '375px',
              height: '400px'
            }}
            className="mx-auto border border-gray-200 rounded-lg overflow-hidden"
            style={{
              backgroundColor: config.corBackground,
              fontFamily: config.fontePrimaria,
              fontSize: `${config.tamanhoFonteBase}px`
            }}
          >
            <div className="p-4 text-white" style={{ backgroundColor: config.corPrimaria }}>
              <h4 className="font-bold text-lg">TappyOne CRM</h4>
              <p className="opacity-80">Dashboard Preview</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border bg-white"
                    style={{
                      borderRadius: `${config.borderRadius}px`,
                      borderColor: config.corSecundaria + '20',
                      boxShadow: config.sombras ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                  >
                    <div className="w-8 h-8 rounded-full mb-2" style={{ backgroundColor: config.corAccent }} />
                    <h5 className="font-semibold mb-1" style={{ color: config.corTexto }}>Card {i}</h5>
                    <p className="text-sm opacity-70" style={{ color: config.corTexto }}>Exemplo</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 text-white font-medium"
                  style={{
                    backgroundColor: config.corPrimaria,
                    borderRadius: config.estiloButton === 'rounded' ? `${config.borderRadius}px` : 
                                 config.estiloButton === 'pill' ? '9999px' : '4px'
                  }}
                >
                  Botão Primário
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Paletas de Cores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Palette className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Paletas de Cores</h3>
            <p className="text-gray-600">Escolha uma paleta ou personalize as cores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {predefinedPalettes.map((palette) => (
            <motion.div
              key={palette.name}
              whileHover={{ scale: 1.02 }}
              onClick={() => applyPalette(palette)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                config.paleta === palette.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.primary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.secondary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.accent }} />
                </div>
                {config.paleta === palette.name && <Sparkles className="w-4 h-4 text-blue-600" />}
              </div>
              <h4 className="font-semibold text-gray-900">{palette.name}</h4>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { key: 'corPrimaria', label: 'Primária' },
            { key: 'corSecundaria', label: 'Secundária' },
            { key: 'corAccent', label: 'Accent' },
            { key: 'corBackground', label: 'Background' },
            { key: 'corTexto', label: 'Texto' }
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config[key as keyof typeof config] as string}
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={config[key as keyof typeof config] as string}
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tipografia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <Type className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Tipografia</h3>
            <p className="text-gray-600">Configure fontes e tamanhos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Fonte Primária</label>
            <div className="grid grid-cols-2 gap-2">
              {fontFamilies.map((font) => (
                <motion.button
                  key={font.value}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleConfigChange('fontePrimaria', font.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    config.fontePrimaria === font.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  <div className="text-2xl font-bold mb-1">{font.preview}</div>
                  <div className="text-xs text-gray-600">{font.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tamanho Base</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={config.tamanhoFonteBase}
                  onChange={(e) => handleConfigChange('tamanhoFonteBase', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-center">{config.tamanhoFonteBase}px</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Border Radius</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={config.borderRadius}
                  onChange={(e) => handleConfigChange('borderRadius', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-center">{config.borderRadius}px</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Sliders className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Layout e Componentes</h3>
              <p className="text-gray-600">Personalize a aparência dos elementos</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {showAdvanced ? 'Básico' : 'Avançado'}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Modo de Tema</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light', label: 'Claro', icon: Sun },
                { value: 'dark', label: 'Escuro', icon: Moon },
                { value: 'auto', label: 'Auto', icon: Monitor }
              ].map(({ value, label, icon: Icon }) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleConfigChange('tema', value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    config.tema === value ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">{label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.animacoes}
                onChange={(e) => handleConfigChange('animacoes', e.target.checked)}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Animações</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.sombras}
                onChange={(e) => handleConfigChange('sombras', e.target.checked)}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Sombras</span>
            </label>
          </div>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-orange-200"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CSS Personalizado</label>
                <textarea
                  value={config.cssCustom}
                  onChange={(e) => handleConfigChange('cssCustom', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                  placeholder="/* Adicione seu CSS personalizado aqui */"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Ações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between bg-white rounded-2xl p-6 border border-gray-200"
      >
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Gerenciar Tema</h4>
          <p className="text-sm text-gray-600">Exporte, importe ou restaure configurações</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={exportTheme}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
