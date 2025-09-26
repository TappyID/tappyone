'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Tag,
  TrendingUp,
  Star,
  Eye,
  EyeOff,
  Palette,
  Hash,
  Users,
  BarChart3
} from 'lucide-react'

interface TagData {
  id: string
  nome: string
  descricao?: string
  cor: string
  categoria: string
  uso_count: number
  criado_em: string
  criado_por: string
  ativo: boolean
  favorito: boolean
}

interface TagsStatsProps {
  tags: TagData[]
}

export default function TagsStats({ tags }: TagsStatsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const totalTags = tags.length
  const tagsAtivas = tags.filter(tag => tag.ativo).length
  const tagsInativas = tags.filter(tag => !tag.ativo).length
  const tagsFavoritas = tags.filter(tag => tag.favorito).length
  const totalUsos = tags.reduce((sum, tag) => sum + tag.uso_count, 0)
  const mediaUsos = totalTags > 0 ? Math.round(totalUsos / totalTags) : 0

  // Estatísticas por categoria
  const categorias = Array.from(new Set(tags.map(tag => tag.categoria)))
  const estatisticasCategorias = categorias.map(categoria => {
    const tagsCategoria = tags.filter(tag => tag.categoria === categoria)
    return {
      categoria,
      count: tagsCategoria.length,
      usos: tagsCategoria.reduce((sum, tag) => sum + tag.uso_count, 0),
      ativas: tagsCategoria.filter(tag => tag.ativo).length
    }
  }).sort((a, b) => b.count - a.count)

  // Tags mais usadas
  const tagsMaisUsadas = [...tags]
    .sort((a, b) => b.uso_count - a.uso_count)
    .slice(0, 5)

  const stats = [
    {
      title: 'Total de Tags',
      value: totalTags,
      subtitle: `${tagsAtivas} ativas`,
      icon: Tag,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: '+12%'
    },
    {
      title: 'Tags Ativas',
      value: tagsAtivas,
      subtitle: `${Math.round((tagsAtivas / totalTags) * 100)}% do total`,
      icon: Eye,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      trend: '+8%'
    },
    {
      title: 'Favoritas',
      value: tagsFavoritas,
      subtitle: 'Tags marcadas como favoritas',
      icon: Star,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      trend: '+15%'
    },
    {
      title: 'Total de Usos',
      value: totalUsos.toLocaleString(),
      subtitle: `Média de ${mediaUsos} por tag`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      trend: '+23%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 border-slate-600 hover:shadow-2xl hover:shadow-slate-900/20' 
                  : 'bg-white border-gray-200 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isDark 
                        ? 'bg-gradient-to-br from-slate-700 to-slate-600 border border-slate-500' 
                        : stat.bgColor
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        isDark ? 'text-emerald-400' : stat.textColor
                      }`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>{stat.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{stat.value}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          stat.trend.startsWith('+') 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>{stat.subtitle}</p>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="mt-4">
                <div className={`w-full rounded-full h-2 ${
                  isDark ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(() => {
                      const numericValue = typeof stat.value === 'string' ? parseInt(stat.value.replace(/,/g, '')) || 0 : stat.value;
                      const maxValue = Math.max(...stats.map(s => typeof s.value === 'string' ? parseInt(s.value.replace(/,/g, '')) || 0 : s.value));
                      return maxValue > 0 ? (numericValue / maxValue) * 100 : 0;
                    })()}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                    className={`h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Categorias e Tags Mais Usadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-2xl p-6 shadow-sm border ${
            isDark 
              ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 border-slate-600' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' 
                  : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
              }`}>
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Categorias</h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Distribuição por categoria</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{categorias.length}</div>
              <div className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>Total</div>
            </div>
          </div>

          <div className="space-y-4">
            {estatisticasCategorias.map((categoria, index) => {
              const percentage = totalTags > 0 ? (categoria.count / totalTags) * 100 : 0
              
              return (
                <motion.div
                  key={categoria.categoria}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                  className="flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    <Hash className={`w-5 h-5 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>{categoria.categoria}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{categoria.count}</span>
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    
                    <div className={`w-full rounded-full h-2 ${
                      isDark ? 'bg-slate-700' : 'bg-gray-100'
                    }`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.8, duration: 1 }}
                        className={`h-2 rounded-full ${
                          isDark 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' 
                            : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
                        }`}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>{categoria.usos} usos</span>
                      <span className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>{categoria.ativas} ativas</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Tags Mais Usadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`rounded-2xl p-6 shadow-sm border ${
            isDark 
              ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 border-slate-600' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' 
                  : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
              }`}>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Mais Usadas</h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Top 5 tags por uso</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {tagsMaisUsadas.map((tag, index) => {
              const maxUsos = tagsMaisUsadas[0]?.uso_count || 1
              const percentage = (tag.uso_count / maxUsos) * 100
              
              return (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-slate-700' : 'bg-gray-100'
                    }`}>
                      <span className={`text-xs font-bold ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>#{index + 1}</span>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: tag.cor }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>{tag.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{tag.uso_count}</span>
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>usos</span>
                        {tag.favorito && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                      </div>
                    </div>
                    
                    <div className={`w-full rounded-full h-2 ${
                      isDark ? 'bg-slate-700' : 'bg-gray-100'
                    }`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.9, duration: 1 }}
                        className="h-2 rounded-full"
                        style={{ backgroundColor: tag.cor }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>{tag.categoria}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        tag.ativo 
                          ? (isDark ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-green-100 text-green-600') 
                          : (isDark ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-600')
                      }`}>
                        {tag.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
