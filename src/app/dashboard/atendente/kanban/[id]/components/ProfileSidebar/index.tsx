'use client'

import React, { useState } from 'react'
import { X, Tag, DollarSign, Calendar, StickyNote, Ticket, FileText, ChevronDown, ChevronUp, Edit3 } from 'lucide-react'

// Componente de Seção Expansível
const ExpandableSection = ({ 
  theme, 
  icon, 
  title, 
  count, 
  isExpanded, 
  onToggle, 
  children 
}) => {
  return (
    <div className={`rounded-lg overflow-hidden ${
      theme === 'dark' ? 'bg-slate-700' : 'bg-white border'
    }`}>
      <button 
        onClick={onToggle}
        className={`w-full p-3 text-left transition-colors flex items-center justify-between ${
          theme === 'dark' ? 'hover:bg-slate-600 text-white' : 'hover:bg-gray-50 text-gray-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            {React.cloneElement(icon, { className: "w-5 h-5" })}
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </div>
          <span>{title}</span>
        </div>
        
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className={`p-3 border-t ${
          theme === 'dark' ? 'border-slate-600 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
        }`}>
          {children}
        </div>
      )}
    </div>
  )
}

const ProfileSidebar = ({ 
  isOpen, 
  onClose, 
  theme, 
  contactName, 
  contactNumber, 
  counts,
  onEditLead
}) => {
  if (!isOpen) return null
  
  // Estados para controlar quais seções estão expandidas
  const [expandedSections, setExpandedSections] = useState({
    tags: false,
    orcamentos: false,
    agendamentos: false,
    anotacoes: false,
    tickets: false,
    assinaturas: false
  })
  
  // Função para alternar expansão
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  // TODO: Buscar dados reais do backend
  const mockData = {
    tags: [
      { id: 1, nome: 'VIP', cor: '#3b82f6' },
      { id: 2, nome: 'Urgente', cor: '#ef4444' }
    ],
    orcamentos: [
      { id: 1, numero: '001', valorTotal: '1500.00', descricao: 'Desenvolvimento Website' },
      { id: 2, numero: '002', valorTotal: '800.00', descricao: 'Manutenção Sistema' }
    ],
    agendamentos: [
      { id: 1, titulo: 'Reunião Cliente', dataInicio: '2024-01-20', descricao: 'Apresentação do projeto' },
      { id: 2, titulo: 'Entrega Final', dataInicio: '2024-01-25', descricao: 'Deploy em produção' }
    ],
    anotacoes: [
      { id: 1, conteudo: 'Cliente prefere contato por WhatsApp', criadoEm: '2024-01-15' },
      { id: 2, conteudo: 'Pagamento sempre no dia 10', criadoEm: '2024-01-10' }
    ],
    tickets: [
      { id: 1, titulo: 'Bug no login', status: 'aberto', prioridade: 'alta' },
      { id: 2, titulo: 'Nova feature', status: 'em_progresso', prioridade: 'media' }
    ],
    assinaturas: [
      { id: 1, plano: 'Premium', valor: '99.90', status: 'ativo' },
      { id: 2, plano: 'Basic', valor: '49.90', status: 'cancelado' }
    ]
  }
  
  return (
    <div className={`w-2/5 flex flex-col transition-all duration-300 ${
      theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'
    } rounded-r-2xl border-l ${
      theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Informações do Contato
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Conteúdo do Sidebar com Scroll Customizada */}
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        {/* Avatar e Nome */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mb-3">
            {contactName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <h4 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {contactName || 'Sem nome'}
          </h4>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {contactNumber || 'Sem número'}
          </p>
          
          {/* Botão Editar Lead */}
          <button
            onClick={onEditLead}
            className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span className="text-sm font-medium">Editar Lead</span>
          </button>
        </div>

        {/* Seções Expansíveis */}
        <div className="space-y-2 pt-4">
          {/* Tags */}
          <ExpandableSection
            theme={theme}
            icon={<Tag />}
            title="Tags"
            count={counts?.tags || 0}
            isExpanded={expandedSections.tags}
            onToggle={() => toggleSection('tags')}
          >
            <div className="space-y-2">
              {mockData.tags.length > 0 ? (
                mockData.tags.map(tag => (
                  <div key={tag.id} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: tag.cor }}
                    />
                    <span className="text-sm">{tag.nome}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma tag encontrada</p>
              )}
            </div>
          </ExpandableSection>

          {/* Orçamentos */}
          <ExpandableSection
            theme={theme}
            icon={<DollarSign />}
            title="Orçamentos"
            count={counts?.orcamentos || 0}
            isExpanded={expandedSections.orcamentos}
            onToggle={() => toggleSection('orcamentos')}
          >
            <div className="space-y-2">
              {mockData.orcamentos.length > 0 ? (
                mockData.orcamentos.map(orc => (
                  <div key={orc.id} className={`p-2 rounded ${
                    theme === 'dark' ? 'bg-slate-600' : 'bg-white'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">#{orc.numero}</span>
                      <span className="text-green-600 font-semibold text-sm">
                        R$ {orc.valorTotal}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{orc.descricao}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum orçamento encontrado</p>
              )}
            </div>
          </ExpandableSection>

          {/* Agendamentos */}
          <ExpandableSection
            theme={theme}
            icon={<Calendar />}
            title="Agendamentos"
            count={counts?.agendamentos || 0}
            isExpanded={expandedSections.agendamentos}
            onToggle={() => toggleSection('agendamentos')}
          >
            <div className="space-y-2">
              {mockData.agendamentos.length > 0 ? (
                mockData.agendamentos.map(agend => (
                  <div key={agend.id} className={`p-2 rounded ${
                    theme === 'dark' ? 'bg-slate-600' : 'bg-white'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{agend.titulo}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(agend.dataInicio).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{agend.descricao}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum agendamento encontrado</p>
              )}
            </div>
          </ExpandableSection>

          {/* Anotações */}
          <ExpandableSection
            theme={theme}
            icon={<StickyNote />}
            title="Anotações"
            count={counts?.anotacoes || 0}
            isExpanded={expandedSections.anotacoes}
            onToggle={() => toggleSection('anotacoes')}
          >
            <div className="space-y-2">
              {mockData.anotacoes.length > 0 ? (
                mockData.anotacoes.map(anot => (
                  <div key={anot.id} className={`p-2 rounded ${
                    theme === 'dark' ? 'bg-slate-600' : 'bg-white'
                  }`}>
                    <p className="text-sm">{anot.conteudo}</p>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {new Date(anot.criadoEm).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma anotação encontrada</p>
              )}
            </div>
          </ExpandableSection>

          {/* Tickets */}
          <ExpandableSection
            theme={theme}
            icon={<Ticket />}
            title="Tickets"
            count={counts?.tickets || 0}
            isExpanded={expandedSections.tickets}
            onToggle={() => toggleSection('tickets')}
          >
            <div className="space-y-2">
              {mockData.tickets.length > 0 ? (
                mockData.tickets.map(ticket => (
                  <div key={ticket.id} className={`p-2 rounded ${
                    theme === 'dark' ? 'bg-slate-600' : 'bg-white'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{ticket.titulo}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        ticket.prioridade === 'alta' 
                          ? 'bg-red-500 text-white'
                          : ticket.prioridade === 'media'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}>
                        {ticket.prioridade}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">
                      Status: {ticket.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum ticket encontrado</p>
              )}
            </div>
          </ExpandableSection>

          {/* Assinaturas */}
          <ExpandableSection
            theme={theme}
            icon={<FileText />}
            title="Assinaturas"
            count={counts?.assinaturas || 0}
            isExpanded={expandedSections.assinaturas}
            onToggle={() => toggleSection('assinaturas')}
          >
            <div className="space-y-2">
              {mockData.assinaturas.length > 0 ? (
                mockData.assinaturas.map(assin => (
                  <div key={assin.id} className={`p-2 rounded ${
                    theme === 'dark' ? 'bg-slate-600' : 'bg-white'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{assin.plano}</span>
                      <span className="text-green-600 font-semibold text-sm">
                        R$ {assin.valor}
                      </span>
                    </div>
                    <span className={`text-xs mt-1 block ${
                      assin.status === 'ativo' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      Status: {assin.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma assinatura encontrada</p>
              )}
            </div>
          </ExpandableSection>
        </div>
      </div>
    </div>
  )
}

export default ProfileSidebar
