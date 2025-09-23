import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'

interface OrcamentosExpandidoProps {
  cardId: string
  columnColor: string
  theme: string
  onOpenOrcamento: () => void
}

export default function OrcamentosExpandido({ 
  cardId, 
  columnColor, 
  theme,
  onOpenOrcamento 
}: OrcamentosExpandidoProps) {
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar orçamentos para este card específico
  useEffect(() => {
    const fetchOrcamentos = async () => {
      try {
        setLoading(true)
        const telefone = cardId.replace('@c.us', '')
        
        console.log('💰 [OrcamentosExpandido] Buscando orçamentos para:', telefone)
        
        // 1. Buscar UUID do contato
        const contactResponse = await fetch(`/api/contatos?telefone=${telefone}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!contactResponse.ok) {
          console.log('💰 [OrcamentosExpandido] Contato não encontrado')
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
          console.log('💰 [OrcamentosExpandido] UUID não encontrado')
          setOrcamentos([])
          return
        }
        
        console.log('💰 [OrcamentosExpandido] UUID encontrado:', contatoUUID)
        
        // 2. Buscar orçamentos
        const orcamentosResponse = await fetch(`/api/orcamentos?contato_id=${contatoUUID}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (orcamentosResponse.ok) {
          const data = await orcamentosResponse.json()
          const orcamentosData = data.data || data || []
          console.log('💰 [OrcamentosExpandido] Orçamentos encontrados:', orcamentosData.length)
          setOrcamentos(orcamentosData)
        }
      } catch (error) {
        console.error('💰 [OrcamentosExpandido] Erro:', error)
        setOrcamentos([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrcamentos()
  }, [cardId])

  if (loading) {
    return (
      <div className={`p-4 rounded-lg text-center ${
        theme === 'dark' ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100/50 text-gray-600'
      }`}>
        <p className="text-sm">Carregando orçamentos...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mt-3 space-y-2"
      style={{ overflow: 'hidden' }}
    >
      {orcamentos.length > 0 ? (
        orcamentos.map((orc: any, index: number) => (
          <motion.div
            key={orc.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-black/30' : 'bg-white/50'
            }`}
            style={{
              borderLeft: `3px solid ${columnColor}`,
              background: theme === 'dark' 
                ? `linear-gradient(135deg, ${columnColor}10 0%, transparent 100%)`
                : `linear-gradient(135deg, ${columnColor}05 0%, transparent 100%)`
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">
                  {orc.titulo || `Orçamento #${orc.id.slice(0, 8)}`}
                </h4>
                <p className="text-xs opacity-70 mb-2">
                  {orc.descricao || 'Sem descrição'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: columnColor }}>
                  R$ {(() => {
                    let valor = parseFloat(orc.valorTotal) || 0
                    if (valor === 0 && orc.itens && Array.isArray(orc.itens)) {
                      valor = orc.itens.reduce((sum: number, item: any) => {
                        const quantidade = parseFloat(item.quantidade) || 0
                        const valorUnitario = parseFloat(item.valorUnitario || item.valor) || 0
                        return sum + (quantidade * valorUnitario)
                      }, 0)
                    }
                    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                  })()}
                </div>
                <div className="text-xs opacity-60">
                  {orc.criadoEm ? new Date(orc.criadoEm).toLocaleDateString('pt-BR') : 'Data não definida'}
                </div>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-4 rounded-lg text-center ${
            theme === 'dark' ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100/50 text-gray-600'
          }`}
        >
          <DollarSign className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum orçamento encontrado</p>
          <button
            onClick={onOpenOrcamento}
            className="mt-2 text-xs underline hover:opacity-80"
            style={{ color: columnColor }}
          >
            Criar novo orçamento
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
