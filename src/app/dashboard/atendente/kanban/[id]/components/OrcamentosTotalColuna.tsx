import React, { useState, useEffect } from 'react'
import { DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

interface OrcamentosTotalColunaProps {
  cards: any[]
  columnColor: string
  theme: string
}

export default function OrcamentosTotalColuna({ 
  cards, 
  columnColor, 
  theme 
}: OrcamentosTotalColunaProps) {
  const [totalOrcamentos, setTotalOrcamentos] = useState(0)
  const [totalValor, setTotalValor] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllOrcamentos = async () => {
      try {
        setLoading(true)
        let totalCount = 0
        let totalValue = 0

        // Buscar orçamentos para cada card
        for (const card of cards) {
          const telefone = card.id.replace('@c.us', '')
          
          // 1. Buscar UUID do contato
          const contactResponse = await fetch(`/api/contatos?telefone=${telefone}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          
          if (!contactResponse.ok) continue
          
          const contactData = await contactResponse.json()
          let contatoUUID = null
          
          if (Array.isArray(contactData) && contactData.length > 0) {
            const specificContact = contactData.find((c: any) => c.numeroTelefone === telefone)
            contatoUUID = specificContact?.id
          } else if (contactData?.data && Array.isArray(contactData.data)) {
            const specificContact = contactData.data.find((c: any) => c.numeroTelefone === telefone)
            contatoUUID = specificContact?.id
          }
          
          if (!contatoUUID) continue
          
          // 2. Buscar orçamentos
          const orcamentosResponse = await fetch(`/api/orcamentos?contato_id=${contatoUUID}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          
          if (orcamentosResponse.ok) {
            const data = await orcamentosResponse.json()
            const orcamentosData = data.data || data || []
            
            totalCount += orcamentosData.length
            
            // Calcular valor total
            const cardTotal = orcamentosData.reduce((sum: number, orc: any) => {
              let valor = parseFloat(orc.valorTotal) || 0
              if (valor === 0 && orc.itens && Array.isArray(orc.itens)) {
                valor = orc.itens.reduce((itemSum: number, item: any) => {
                  const quantidade = parseFloat(item.quantidade) || 0
                  const valorUnitario = parseFloat(item.valorUnitario || item.valor) || 0
                  return itemSum + (quantidade * valorUnitario)
                }, 0)
              }
              return sum + valor
            }, 0)
            
            totalValue += cardTotal
          }
        }

        setTotalOrcamentos(totalCount)
        setTotalValor(totalValue)
        console.log('💰 [OrcamentosTotalColuna] Total:', totalCount, 'Valor:', totalValue)
      } catch (error) {
        console.error('💰 [OrcamentosTotalColuna] Erro:', error)
      } finally {
        setLoading(false)
      }
    }

    if (cards.length > 0) {
      fetchAllOrcamentos()
    }
  }, [cards])

  // Se não houver orçamentos, não renderizar
  if (!loading && totalOrcamentos === 0) return null

  return (
    <motion.div
      className="px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-500 overflow-hidden relative"
      style={{
        background: theme === 'dark'
          ? `linear-gradient(135deg, ${columnColor}15 0%, rgba(0,0,0,0.3) 100%)`
          : `linear-gradient(135deg, ${columnColor}10 0%, rgba(255,255,255,0.8) 100%)`,
        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign 
            className="w-[15px] h-[15px]" 
            style={{ color: columnColor }}
          />
          <span className={`text-xs font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {loading ? 'Carregando...' : `${totalOrcamentos} orçamento${totalOrcamentos !== 1 ? 's' : ''}`}
          </span>
        </div>
        {!loading && totalValor > 0 && (
          <div className="text-sm font-bold" style={{ color: columnColor }}>
            {totalValor.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
