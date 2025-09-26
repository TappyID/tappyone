import React, { useState, useEffect } from 'react'
import { DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

interface OrcamentosBadgeProps {
  cardId: string
  columnColor: string
  theme: string
  onClick: () => void
}

export default function OrcamentosBadge({ 
  cardId, 
  columnColor, 
  theme,
  onClick 
}: OrcamentosBadgeProps) {
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalValor, setTotalValor] = useState(0)

  // Buscar orçamentos para este card específico
  useEffect(() => {
    const fetchOrcamentos = async () => {
      try {
        setLoading(true)
        const telefone = cardId.replace('@c.us', '')
        
        console.log('💰 [OrcamentosBadge] Buscando orçamentos para:', telefone)
        
        // 1. Buscar UUID do contato
        const contactResponse = await fetch(`/api/contatos?telefone=${telefone}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!contactResponse.ok) {
          console.log('💰 [OrcamentosBadge] Contato não encontrado')
          setOrcamentos([])
          return
        }
        
        const contactData = await contactResponse.json()
        let contatoUUID = null
        
        if (Array.isArray(contactData) && contactData.length > 0) {
          const specificContact = contactData.find((c: any) => c.numeroTelefone === telefone)
          contatoUUID = specificContact?.id
        } else if (contactData?.data && Array.isArray(contactData.data)) {
          const specificContact = contactData.data.find((c: any) => c.numeroTelefone === telefone)
          contatoUUID = specificContact?.id
        }
        
        if (!contatoUUID) {
          console.log('💰 [OrcamentosBadge] UUID não encontrado')
          setOrcamentos([])
          return
        }
        
        console.log('💰 [OrcamentosBadge] UUID encontrado:', contatoUUID)
        
        // 2. Buscar orçamentos
        const orcamentosResponse = await fetch(`/api/orcamentos?contato_id=${contatoUUID}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (orcamentosResponse.ok) {
          const data = await orcamentosResponse.json()
          const orcamentosData = data.data || data || []
          console.log('💰 [OrcamentosBadge] Orçamentos encontrados:', orcamentosData.length)
          setOrcamentos(orcamentosData)
          
          // Calcular valor total
          const total = orcamentosData.reduce((sum: number, orc: any) => {
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
          
          setTotalValor(total)
        }
      } catch (error) {
        console.error('💰 [OrcamentosBadge] Erro:', error)
        setOrcamentos([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrcamentos()
  }, [cardId])

  // Se não houver orçamentos, não renderizar
  if (orcamentos.length === 0) return null

  return (
    <motion.div
      className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200"
      style={{
        background: theme === 'dark' 
          ? `${columnColor}15`
          : `${columnColor}10`,
        border: `1px solid ${columnColor}30`
      }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center gap-2">
        <DollarSign className="w-3.5 h-3.5" style={{ color: columnColor }} />
        <span className={`text-xs font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          {orcamentos.length} Orçamento{orcamentos.length > 1 ? 's' : ''}
        </span>
      </div>
      {totalValor > 0 && (
        <div className="text-xs font-bold" style={{ color: columnColor }}>
          R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      )}
    </motion.div>
  )
}
