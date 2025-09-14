import React from 'react'
import { useConexaoFila } from '@/hooks/useConexaoFila'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Wifi, 
  WifiOff, 
  Users, 
  Network,
  Circle
} from 'lucide-react'

interface ConexaoFilaBadgesProps {
  card: {
    id: string
    contato?: {
      numero_telefone?: string
    }
  }
  onClick?: (card: any) => void
}

export default function ConexaoFilaBadges({ card, onClick }: ConexaoFilaBadgesProps) {
  const { theme } = useTheme()
  
  // Extrair número do contato (remover @c.us se existir)
  const contatoId = card.contato?.numero_telefone?.replace('@c.us', '') || card.id.replace('@c.us', '')
  
  const { 
    data, 
    loading, 
    hasConnection, 
    isConnected, 
    fila, 
    atendentes, 
    conexao 
  } = useConexaoFila({ 
    contatoId,
    enabled: !!contatoId 
  })

  if (loading || !hasConnection) {
    return null
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClick?.(card)
  }

  return (
    <div 
      className={`flex flex-wrap gap-1 mb-2 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {/* Badge de Conexão */}
      <div 
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: isConnected ? '#10b98120' : '#6b728020',
          borderColor: isConnected ? '#10b98140' : '#6b728040',
          color: isConnected ? '#10b981' : '#6b7280'
        }}
        title={`Conexão: ${conexao?.status || 'desconectada'} ${conexao?.sessionName ? `(${conexao.sessionName})` : ''}`}
      >
        {isConnected ? (
          <Wifi className="w-[11px] h-[11px]" />
        ) : (
          <WifiOff className="w-[11px] h-[11px]" />
        )}
        <span>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      {/* Badge de Fila */}
      {fila?.id && (
        <div 
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
          style={{
            backgroundColor: `${fila.cor}20` || '#3b82f620',
            borderColor: `${fila.cor}40` || '#3b82f640',
            color: fila.cor || '#3b82f6'
          }}
          title={`Fila: ${fila.nome}`}
        >
          <Network className="w-[11px] h-[11px]" />
          <span>{fila.nome}</span>
        </div>
      )}

      {/* Badge de Atendentes */}
      {atendentes.length > 0 && (
        <div 
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
          style={{
            backgroundColor: '#8b5cf620',
            borderColor: '#8b5cf640',
            color: '#8b5cf6'
          }}
          title={`${atendentes.length} atendente(s): ${atendentes.map(a => a.nome).join(', ')}`}
        >
          <Users className="w-[11px] h-[11px]" />
          <span>{atendentes.length}</span>
        </div>
      )}

      {/* Indicador de Status Geral */}
      <div 
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: hasConnection && isConnected && fila?.id ? '#10b98120' : '#f59e0b20',
          borderColor: hasConnection && isConnected && fila?.id ? '#10b98140' : '#f59e0b40',
          color: hasConnection && isConnected && fila?.id ? '#10b981' : '#f59e0b'
        }}
        title={
          hasConnection && isConnected && fila?.id 
            ? 'Sistema configurado completamente' 
            : 'Configuração incompleta - precisa configurar conexão/fila'
        }
      >
        <Circle 
          className="w-[8px] h-[8px]" 
          fill="currentColor"
        />
        <span>
          {hasConnection && isConnected && fila?.id ? 'Ativo' : 'Config'}
        </span>
      </div>
    </div>
  )
}
