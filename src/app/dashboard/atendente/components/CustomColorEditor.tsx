'use client'

import { useState } from 'react'
import { Sliders, Save, Palette } from 'lucide-react'
import { useColorTheme } from '@/contexts/ColorThemeContext'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'

export function CustomColorEditor() {
  const { colorTheme, setColorTheme } = useColorTheme()
  const { theme } = useTheme()
  
  const [customPrimary, setCustomPrimary] = useState(colorTheme.primary)
  const [customSecondary, setCustomSecondary] = useState(colorTheme.secondary)
  const [customAccent, setCustomAccent] = useState(colorTheme.accent)
  const [customName, setCustomName] = useState('Meu Tema')
  const [lightness, setLightness] = useState(50)
  const [darkness, setDarkness] = useState(50)
  const [gradientAngle, setGradientAngle] = useState(135)

  // Ajustar lightness/darkness da cor
  const adjustColor = (color: string, lightAdjust: number, darkAdjust: number) => {
    const hex = color.replace('#', '')
    let r = parseInt(hex.substring(0, 2), 16)
    let g = parseInt(hex.substring(2, 4), 16)
    let b = parseInt(hex.substring(4, 6), 16)

    // Aplicar ajustes
    const lightFactor = (lightAdjust - 50) / 50 // -1 a 1
    const darkFactor = (darkAdjust - 50) / 50 // -1 a 1
    
    r = Math.min(255, Math.max(0, r + (lightFactor * 100) - (darkFactor * 50)))
    g = Math.min(255, Math.max(0, g + (lightFactor * 100) - (darkFactor * 50)))
    b = Math.min(255, Math.max(0, b + (lightFactor * 100) - (darkFactor * 50)))

    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
  }

  const handleSaveCustomTheme = () => {
    const adjustedPrimary = adjustColor(customPrimary, lightness, darkness)
    const adjustedSecondary = adjustColor(customSecondary, lightness, darkness)
    const adjustedAccent = adjustColor(customAccent, lightness, darkness)

    const newTheme = {
      id: 'custom-' + Date.now(),
      name: customName,
      primary: adjustedPrimary,
      secondary: adjustedSecondary,
      accent: adjustedAccent,
      colors: [adjustedPrimary, adjustedSecondary, adjustedAccent, adjustColor(adjustedAccent, 70, 30)]
    }
    
    setColorTheme(newTheme)
    
    // Salvar no localStorage
    const savedCustomThemes = JSON.parse(localStorage.getItem('customThemes') || '[]')
    savedCustomThemes.push(newTheme)
    localStorage.setItem('customThemes', JSON.stringify(savedCustomThemes))
  }

  return (
    <div className="space-y-6">
      {/* Nome do Tema */}
      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Nome do Tema
        </label>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Meu Tema Personalizado"
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
            theme === 'dark'
              ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
              : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
          } outline-none`}
        />
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Cor Primária
          </label>
          <div className="space-y-2">
            <input
              type="color"
              value={customPrimary}
              onChange={(e) => setCustomPrimary(e.target.value)}
              className="w-full h-16 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-slate-600"
            />
            <input
              type="text"
              value={customPrimary}
              onChange={(e) => setCustomPrimary(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-center font-mono text-sm ${
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Cor Secundária
          </label>
          <div className="space-y-2">
            <input
              type="color"
              value={customSecondary}
              onChange={(e) => setCustomSecondary(e.target.value)}
              className="w-full h-16 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-slate-600"
            />
            <input
              type="text"
              value={customSecondary}
              onChange={(e) => setCustomSecondary(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-center font-mono text-sm ${
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Cor de Destaque
          </label>
          <div className="space-y-2">
            <input
              type="color"
              value={customAccent}
              onChange={(e) => setCustomAccent(e.target.value)}
              className="w-full h-16 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-slate-600"
            />
            <input
              type="text"
              value={customAccent}
              onChange={(e) => setCustomAccent(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-center font-mono text-sm ${
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Lightness, Darkness & Angle Sliders */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-sm font-semibold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Sliders className="w-4 h-4" />
              Claridade ({lightness}%)
            </label>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={lightness}
            onChange={(e) => setLightness(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #1e293b 0%, #60a5fa ${lightness}%, #ddd ${lightness}%, #ddd 100%)`
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-sm font-semibold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Sliders className="w-4 h-4" />
              Escuridão ({darkness}%)
            </label>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={darkness}
            onChange={(e) => setDarkness(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #1e293b 0%, #1e293b ${darkness}%, #ddd ${darkness}%, #ddd 100%)`
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-sm font-semibold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Sliders className="w-4 h-4" />
              Ângulo do Gradiente ({gradientAngle}°)
            </label>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={gradientAngle}
            onChange={(e) => setGradientAngle(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #ec4899 50%, #f59e0b 100%)`
            }}
          />
          <div className="flex justify-between text-xs mt-1">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>0° (→)</span>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>90° (↓)</span>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>180° (←)</span>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>270° (↑)</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className={`block text-sm font-semibold mb-3 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Preview do Gradiente
        </label>
        <div
          className="h-32 rounded-2xl shadow-lg relative overflow-hidden"
          style={{
            background: `linear-gradient(${gradientAngle}deg, ${adjustColor(customPrimary, lightness, darkness)}, ${adjustColor(customSecondary, lightness, darkness)})`
          }}
        >
          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs font-mono">
            {gradientAngle}° | {adjustColor(customPrimary, lightness, darkness)} → {adjustColor(customSecondary, lightness, darkness)}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSaveCustomTheme}
        className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        Salvar e Aplicar Tema
      </motion.button>

      {/* Info */}
      <div className={`p-4 rounded-xl ${
        theme === 'dark'
          ? 'bg-blue-900/20 border border-blue-600/30'
          : 'bg-blue-50 border border-blue-200'
      }`}>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
        }`}>
          💾 <strong>Atenção:</strong> Seu tema personalizado será salvo no <strong>localStorage</strong> do navegador. Para sincronizar entre dispositivos, implementaremos salvamento no banco de dados em breve!
        </p>
      </div>
    </div>
  )
}
