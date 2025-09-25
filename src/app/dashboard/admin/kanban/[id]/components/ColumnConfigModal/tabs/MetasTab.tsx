'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, TrendingUp, DollarSign, Calendar, Users, 
  Trophy, Rocket, Plus, Edit2, Trash2, Check
} from 'lucide-react'
import MetaCard from '../components/MetaCard'
import ProgressRing from '../components/ProgressRing'

interface MetasTabProps {
  coluna: {
    id: string
    nome: string
    cor: string
  }
  theme: string
}

interface Meta {
  id: string
  tipo: 'vendas' | 'orcamentos' | 'reunioes' | 'tickets' | 'custom'
  titulo: string
  valor: number
  valorAtual: number
  prazo: string
  icon: any
  cor: string
}

export default function MetasTab({ coluna, theme }: MetasTabProps) {
  const [metas, setMetas] = useState<Meta[]>([
    {
      id: '1',
      tipo: 'vendas',
      titulo: 'Meta de Vendas',
      valor: 100000,
      valorAtual: 45000,
      prazo: '30 dias',
      icon: DollarSign,
      cor: '#10B981'
    },
    {
      id: '2',
      tipo: 'orcamentos',
      titulo: 'Orçamentos Enviados',
      valor: 50,
      valorAtual: 23,
      prazo: '15 dias',
      icon: Target,
      cor: '#8B5CF6'
    },
    {
      id: '3',
      tipo: 'reunioes',
      titulo: 'Reuniões Agendadas',
      valor: 20,
      valorAtual: 12,
      prazo: '7 dias',
      icon: Calendar,
      cor: '#F59E0B'
    }
  ])

  const [showNewMeta, setShowNewMeta] = useState(false)
  const [newMeta, setNewMeta] = useState({
    titulo: '',
    valor: 0,
    tipo: 'custom' as const,
    prazo: '30 dias'
  })

  const addMeta = () => {
    if (newMeta.titulo && newMeta.valor > 0) {
      const nova: Meta = {
        id: Date.now().toString(),
        tipo: newMeta.tipo,
        titulo: newMeta.titulo,
        valor: newMeta.valor,
        valorAtual: 0,
        prazo: newMeta.prazo,
        icon: Trophy,
        cor: coluna.cor
      }
      setMetas([...metas, nova])
      setNewMeta({ titulo: '', valor: 0, tipo: 'custom', prazo: '30 dias' })
      setShowNewMeta(false)
    }
  }

  const deleteMeta = (id: string) => {
    setMetas(metas.filter(m => m.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-xl"
              style={{ 
                backgroundColor: `${coluna.cor}20`,
                color: coluna.cor 
              }}
            >
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Central de Metas
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Defina objetivos e acompanhe o progresso
              </p>
            </div>
          </div>

          <motion.button
            onClick={() => setShowNewMeta(!showNewMeta)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
            style={{
              boxShadow: `0 4px 15px ${coluna.cor}20`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Nova Meta
          </motion.button>
        </div>

        {/* Resumo Geral */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total de Metas
            </p>
            <p className={`text-2xl font-bold mt-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {metas.length}
            </p>
          </div>
          
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Em Progresso
            </p>
            <p className={`text-2xl font-bold mt-1`} style={{ color: coluna.cor }}>
              {metas.filter(m => m.valorAtual < m.valor).length}
            </p>
          </div>

          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Concluídas
            </p>
            <p className="text-2xl font-bold mt-1 text-green-500">
              {metas.filter(m => m.valorAtual >= m.valor).length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Formulário de Nova Meta */}
      {showNewMeta && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`p-6 rounded-2xl backdrop-blur-xl border ${
            theme === 'dark' 
              ? 'bg-slate-900/50 border-slate-700/30' 
              : 'bg-white/80 border-gray-200/30'
          }`}
        >
          <h4 className={`text-lg font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Criar Nova Meta
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Título da Meta
              </label>
              <input
                type="text"
                value={newMeta.titulo}
                onChange={(e) => setNewMeta({ ...newMeta, titulo: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Ex: Vendas do Mês"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Valor da Meta
              </label>
              <input
                type="number"
                value={newMeta.valor}
                onChange={(e) => setNewMeta({ ...newMeta, valor: Number(e.target.value) })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="0"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tipo
              </label>
              <select
                value={newMeta.tipo}
                onChange={(e) => setNewMeta({ ...newMeta, tipo: e.target.value as any })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="vendas">Vendas</option>
                <option value="orcamentos">Orçamentos</option>
                <option value="reunioes">Reuniões</option>
                <option value="tickets">Tickets</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Prazo
              </label>
              <select
                value={newMeta.prazo}
                onChange={(e) => setNewMeta({ ...newMeta, prazo: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="7 dias">7 dias</option>
                <option value="15 dias">15 dias</option>
                <option value="30 dias">30 dias</option>
                <option value="90 dias">90 dias</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <motion.button
              onClick={addMeta}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: coluna.cor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check className="w-4 h-4 inline mr-2" />
              Criar Meta
            </motion.button>
            
            <motion.button
              onClick={() => setShowNewMeta(false)}
              className={`px-4 py-2 rounded-lg font-medium ${
                theme === 'dark'
                  ? 'bg-slate-800 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancelar
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Lista de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metas.map((meta, index) => (
          <MetaCard
            key={meta.id}
            meta={meta}
            theme={theme}
            coluna={coluna}
            onDelete={deleteMeta}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Dica */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`p-4 rounded-xl text-center ${
          theme === 'dark' ? 'bg-slate-900/30' : 'bg-gray-50'
        }`}
      >
        <Rocket className="w-8 h-8 mx-auto mb-2" style={{ color: coluna.cor }} />
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          💡 Dica: Configure notificações para ser alertado quando estiver próximo de bater suas metas!
        </p>
      </motion.div>
    </div>
  )
}
