'use client'

import React, { useState, useEffect } from 'react'
import './styles.css' // Importar estilos customizados
import { X, Calendar, DollarSign, Tag, Users, Layers, Trello, FileText, Bot, Ticket, UserCircle, StickyNote, Edit3 } from 'lucide-react'
import ChatHeader from '../../../atendimento/components/TopChatArea/ChatHeader'
import ChatArea from '../../../atendimento/components/ChatArea'
import MessageInput from '../../../atendimento/components/FooterChatArea/MessageInput'
import EditTextModal from '../../../atendimentos/components/EditTextModal'
import QuickActionsSidebar from '../../../atendimentos/components/QuickActionsSidebar'
import { useKanbanIndicators } from '../hooks/useKanbanIndicators'
import { useChatPicture } from '@/hooks/useChatPicture'
import { useAuth } from '@/hooks/useAuth'

// Bottom Sheets
import AgendamentoBottomSheet from '../../../atendimento/components/FooterChatArea/BottomSheets/AgendamentoBottomSheet'
import OrcamentoBottomSheet from '../../../atendimento/components/FooterChatArea/BottomSheets/OrcamentoBottomSheet'
import TagsBottomSheet from '../../../atendimento/components/FooterChatArea/BottomSheets/TagsBottomSheet'
import AnotacoesBottomSheet from '../../../atendimento/components/FooterChatArea/BottomSheets/AnotacoesBottomSheet'
import TicketBottomSheet from '../../../atendimento/components/FooterChatArea/BottomSheets/TicketBottomSheet'
import AssinaturaBottomSheet from '../../../atendimento/components/FooterChatArea/BottomSheets/AssinaturaBottomSheet'
import LeadEditSidebar from './ProfileSidebar/LeadEditSidebar'
import ExpandableDataSection from './ProfileSidebar/ExpandableDataSection'
import ProfileAvatar from './ProfileSidebar/ProfileAvatar'
// import ProfileSidebar from './ProfileSidebar/index'

// Componente ProfileSidebar temporário inline
const ProfileSidebar = ({ 
  isOpen, 
  onClose, 
  theme, 
  contactName, 
  contactNumber,
  chatId, // 🔑 Recebendo o chatId COMPLETO
  columnColor, // 🎨 Recebendo a cor da coluna para scroll
  profileImage, // 📸 Recebendo a foto de perfil
  counts, // 📊 Recebendo os indicadores
  onTagsClick, 
  onOrcamentoClick, 
  onAgendamentoClick,
  onTicketsClick, 
  onAnotacoesClick, 
  onAssinaturaClick,
  onEditLead, // ✏️ Nova prop para editar lead
  hasLeadEditOpen // 🎨 Prop para ajustar bordas
}) => {
  // Estados para controlar expansão de cada seção
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
  // Estados dos dados reais
  const [tagsData, setTagsData] = useState<any[]>([])
  const [orcamentosData, setOrcamentosData] = useState<any[]>([])
  const [agendamentosData, setAgendamentosData] = useState<any[]>([])
  const [anotacoesData, setAnotacoesData] = useState<any[]>([])
  const [ticketsData, setTicketsData] = useState<any[]>([])
  const [assinaturasData, setAssinaturasData] = useState<any[]>([])
  
  // Estados de loading
  const [loadingData, setLoadingData] = useState<Record<string, boolean>>({})
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
      // Buscar dados quando expande pela primeira vez
      fetchSectionData(section)
    }
  }
  
  // Função para buscar dados de cada seção
  const fetchSectionData = async (section: string) => {
    if (loadingData[section]) return // Evita requisições duplicadas
    
    setLoadingData(prev => ({ ...prev, [section]: true }))
    
    try {
      // 🚨 USAR MESMO PADRÃO DOS INDICADORES - Backend GO
      let token = localStorage.getItem('token')
      if (!token) {
        // Token fixo temporário igual aos indicadores
        token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
      }
      
      // Garantir chatId completo com @c.us (igual aos indicadores e bottom sheets!)
      const chatIdFormatado = chatId.includes('@c.us') ? chatId : `${chatId}@c.us`
      const baseUrl = 'http://159.65.34.199:8081'
      const url = `${baseUrl}/api/chats/${encodeURIComponent(chatIdFormatado)}/${section}`
      
      console.log('🔍 [ProfileSidebar] Buscando dados:', { 
        section, 
        url, 
        chatId, 
        chatIdFormatado
      })
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` 
        }
      })
      
      if (!response.ok) throw new Error(`Erro ao buscar ${section}`)
      
      const response_data = await response.json()
      console.log(`📊 [ProfileSidebar] Dados recebidos ${section}:`, response_data)
      
      // 🚨 CORREÇÃO: API retorna {data: [...], success: true}
      const data = response_data.data || response_data
      console.log(`📊 [ProfileSidebar] Array extraído ${section}:`, data)
      
      switch (section) {
        case 'tags':
          setTagsData(Array.isArray(data) ? data : [])
          break
        case 'orcamentos':
          setOrcamentosData(Array.isArray(data) ? data : [])
          break
        case 'agendamentos':
          setAgendamentosData(Array.isArray(data) ? data : [])
          break
        case 'anotacoes':
          setAnotacoesData(Array.isArray(data) ? data : [])
          break
        case 'tickets':
          setTicketsData(Array.isArray(data) ? data : [])
          break
        case 'assinaturas':
          setAssinaturasData(Array.isArray(data) ? data : [])
          break
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar ${section}:`, error)
    } finally {
      setLoadingData(prev => ({ ...prev, [section]: false }))
    }
  }

  if (!isOpen) return null
  
  return (
    <div className={`${hasLeadEditOpen ? 'w-0 opacity-0 overflow-hidden' : 'w-2/5'} flex flex-col transition-all duration-300 ${
      theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'
    } border-l ${
      hasLeadEditOpen ? '' : 'rounded-r-2xl'
    } ${
      theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
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
      
      {/* Conteúdo do Sidebar */}
      <div 
        className="p-6 overflow-y-auto flex-1 custom-dynamic-scroll"
        style={{
          '--dynamic-color': columnColor
        } as React.CSSProperties}
      >
        {/* Avatar e Nome */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full mb-3 overflow-hidden border-2 border-blue-500 shadow-lg">
            {profileImage ? (
              <img
                src={profileImage}
                alt={contactName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback para avatar com inicial se a imagem falhar
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                      ${contactName.charAt(0).toUpperCase()}
                    </div>
                  `
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {contactName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h4 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {contactName}
          </h4>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {contactNumber}
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

        {/* Botões de Ação */}
        <div className="space-y-2 pt-4">
          <button onClick={() => toggleSection('tags')} className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
            theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-900 border'
          }`}>
            <div className="relative">
              <Tag className="w-5 h-5" />
              {counts?.tags > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {counts.tags > 99 ? '99+' : counts.tags}
                </span>
              )}
            </div>
            <span>Gerenciar Tags</span>
          </button>
          
          {/* Seção Expansível - Tags */}
          {expandedSection === 'tags' && (
            <div className={`mt-2 p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-semibold text-blue-500 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags ({tagsData.length})
              </h4>
              <div className="space-y-2">
                {loadingData.tags ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : tagsData.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tagsData.map((tag) => (
                      <span 
                        key={tag.id}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1"
                        style={{ backgroundColor: tag.cor || '#3B82F6' }}
                      >
                        {tag.nome}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhuma tag encontrada
                  </p>
                )}
              </div>
            </div>
          )}
          
          <button onClick={() => toggleSection('orcamentos')} className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
            theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-900 border'
          }`}>
            <div className="relative">
              <DollarSign className="w-5 h-5" />
              {counts?.orcamentos > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {counts.orcamentos > 99 ? '99+' : counts.orcamentos}
                </span>
              )}
            </div>
            <span>Gerenciar Orçamentos</span>
          </button>
          
          {/* Seção Expansível - Orçamentos */}
          {expandedSection === 'orcamentos' && (
            <div className={`mt-2 p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-semibold text-green-500 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Orçamentos ({orcamentosData.length})
              </h4>
              <div className="space-y-3">
                {loadingData.orcamentos ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  </div>
                ) : orcamentosData.length > 0 ? (
                  orcamentosData.map((orcamento) => (
                    <div key={orcamento.id} className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {orcamento.titulo || 'Orçamento sem título'}
                          </h5>
                          {orcamento.descricao && (
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {orcamento.descricao}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-500">
                            R$ {(orcamento.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          {orcamento.status && (
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                              orcamento.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                              orcamento.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {orcamento.status}
                            </span>
                          )}
                        </div>
                      </div>
                      {orcamento.itens && orcamento.itens.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">
                            {orcamento.itens.length} item(ns)
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhum orçamento encontrado
                  </p>
                )}
              </div>
            </div>
          )}
          
          <button onClick={() => toggleSection('agendamentos')} className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
            theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-900 border'
          }`}>
            <div className="relative">
              <Calendar className="w-5 h-5" />
              {counts?.agendamentos > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {counts.agendamentos > 99 ? '99+' : counts.agendamentos}
                </span>
              )}
            </div>
            <span>Gerenciar Agendamentos</span>
          </button>
          
          {/* Seção Expansível - Agendamentos */}
          {expandedSection === 'agendamentos' && (
            <div className={`mt-2 p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-semibold text-purple-500 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Agendamentos ({agendamentosData.length})
              </h4>
              <div className="space-y-3">
                {loadingData.agendamentos ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  </div>
                ) : agendamentosData.length > 0 ? (
                  agendamentosData.map((agendamento) => (
                    <div key={agendamento.id} className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {agendamento.titulo || 'Agendamento'}
                          </h5>
                          {agendamento.descricao && (
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {agendamento.descricao}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-purple-500">
                            {agendamento.dataHora ? new Date(agendamento.dataHora).toLocaleString('pt-BR') : 'Sem data'}
                          </div>
                          {agendamento.status && (
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                              agendamento.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                              agendamento.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {agendamento.status}
                            </span>
                          )}
                        </div>
                      </div>
                      {agendamento.local && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            📍 {agendamento.local}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhum agendamento encontrado
                  </p>
                )}
              </div>
            </div>
          )}
          
          <button onClick={() => toggleSection('anotacoes')} className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
            theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-900 border'
          }`}>
            <div className="relative">
              <StickyNote className="w-5 h-5" />
              {counts?.anotacoes > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {counts.anotacoes > 99 ? '99+' : counts.anotacoes}
                </span>
              )}
            </div>
            <span>Gerenciar Anotações</span>
          </button>
          
          {/* Seção Expansível - Anotações */}
          {expandedSection === 'anotacoes' && (
            <div className={`mt-2 p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-semibold text-yellow-500 mb-3 flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                Anotações ({anotacoesData.length})
              </h4>
              <div className="space-y-3">
                {loadingData.anotacoes ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                  </div>
                ) : anotacoesData.length > 0 ? (
                  anotacoesData.map((anotacao) => (
                    <div key={anotacao.id} className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {anotacao.titulo || 'Anotação'}
                          </h5>
                          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {anotacao.conteudo || anotacao.descricao || 'Sem conteúdo'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {anotacao.criadoEm ? new Date(anotacao.criadoEm).toLocaleDateString('pt-BR') : 'Sem data'}
                          </div>
                          {anotacao.tipo && (
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                              anotacao.tipo === 'importante' ? 'bg-red-100 text-red-800' :
                              anotacao.tipo === 'lembrete' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {anotacao.tipo}
                            </span>
                          )}
                        </div>
                      </div>
                      {anotacao.categoria && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            🏷️ {anotacao.categoria}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhuma anotação encontrada
                  </p>
                )}
              </div>
            </div>
          )}
          
          <button onClick={() => toggleSection('tickets')} className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
            theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-900 border'
          }`}>
            <div className="relative">
              <Ticket className="w-5 h-5" />
              {counts?.tickets > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {counts.tickets > 99 ? '99+' : counts.tickets}
                </span>
              )}
            </div>
            <span>Gerenciar Tickets</span>
          </button>
          
          {/* Seção Expansível - Tickets */}
          {expandedSection === 'tickets' && (
            <div className={`mt-2 p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-semibold text-red-500 mb-3 flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Tickets ({ticketsData.length})
              </h4>
              <div className="space-y-3">
                {loadingData.tickets ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                  </div>
                ) : ticketsData.length > 0 ? (
                  ticketsData.map((ticket) => (
                    <div key={ticket.id} className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            #{ticket.numero || ticket.id} - {ticket.titulo || ticket.assunto || 'Ticket'}
                          </h5>
                          {ticket.descricao && (
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {ticket.descricao}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-white text-xs rounded-full ${
                            ticket.status === 'aberto' ? 'bg-red-500' :
                            ticket.status === 'em_andamento' ? 'bg-yellow-500' :
                            ticket.status === 'resolvido' ? 'bg-green-500' :
                            'bg-gray-500'
                          }`}>
                            {ticket.status || 'Aberto'}
                          </span>
                          {ticket.prioridade && (
                            <div className="mt-1">
                              <span className={`inline-block px-2 py-1 text-xs rounded ${
                                ticket.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                                ticket.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {ticket.prioridade}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {ticket.categoria && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            🏷️ {ticket.categoria}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhum ticket encontrado
                  </p>
                )}
              </div>
            </div>
          )}
         
        </div>

        {/* Seções Expansíveis */}
        {expandedSection === 'assinaturas' && (
          <div className={`mt-4 p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className="font-semibold text-indigo-500 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Assinaturas ({assinaturasData.length})
            </h4>
            <div className="space-y-3">
              {loadingData.assinaturas ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                </div>
              ) : assinaturasData.length > 0 ? (
                assinaturasData.map((assinatura) => (
                  <div key={assinatura.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-600' : 'bg-white'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{assinatura.titulo || assinatura.nome || 'Contrato'}</span>
                      <span className={`px-2 py-1 text-white text-xs rounded-full ${
                        assinatura.status === 'ativo' ? 'bg-green-500' :
                        assinatura.status === 'pendente' ? 'bg-yellow-500' :
                        assinatura.status === 'cancelado' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}>
                        {assinatura.status || 'Ativo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {assinatura.descricao || 
                       (assinatura.dataVencimento ? `Renovação em ${new Date(assinatura.dataVencimento).toLocaleDateString('pt-BR')}` : 
                        assinatura.observacoes || '')}
                    </p>
                    {assinatura.valor && (
                      <div className="text-sm font-medium text-indigo-600 mt-1">
                        R$ {assinatura.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        {assinatura.periodicidade && ` / ${assinatura.periodicidade}`}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Nenhuma assinatura encontrada
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ChatModalKanbanProps {
  isOpen: boolean
  onClose: () => void
  card: any
  theme: string
  columnColor?: string // 🎨 Cor da coluna para scroll customizada
}

// Função para obter URL da WAHA - SEMPRE usar proxy!
const getWahaUrl = (path: string = '') => {
  return `/api/waha-proxy${path}`
}

// Função helper para obter headers com Authorization
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  }
}

// Função para obter sessão ativa do usuário
const getActiveSessionName = async (): Promise<string | null> => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/connections', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    const activeConnection = data.connections?.find((conn: any) => 
      conn.status === 'WORKING' || conn.status === 'connected'
    )
    
    return activeConnection?.sessionName || null
  } catch (error) {
    console.error('❌ Erro ao buscar sessão ativa:', error)
    return null
  }
}

export default function ChatModalKanban({ isOpen, onClose, card, theme, columnColor = '#3B82F6' }: ChatModalKanbanProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [profilePhoto, setProfilePhoto] = useState<string>('')
  
  // Buscar dados do usuário logado
  const { user } = useAuth()
  
  // Função helper para obter nome do usuário
  const getUserName = () => {
    return user?.nome || localStorage.getItem('userName') || localStorage.getItem('user_name') || 'Admin'
  }
  
  // Estados para os modais - IGUAL AO ATENDIMENTO
  const [showEditTextModal, setShowEditTextModal] = useState(false)
  const [showQuickActionsSidebar, setShowQuickActionsSidebar] = useState(false)
  const [showEmojisModal, setShowEmojisModal] = useState(false)
  const [showProfileSidebar, setShowProfileSidebar] = useState(false)
  const [showLeadEditSidebar, setShowLeadEditSidebar] = useState(false)
  
  // Estados dos Bottom Sheets
  const [showAgendamentoSheet, setShowAgendamentoSheet] = useState(false)
  const [showOrcamentoSheet, setShowOrcamentoSheet] = useState(false)
  const [showTagsSheet, setShowTagsSheet] = useState(false)
  const [showAnotacoesSheet, setShowAnotacoesSheet] = useState(false)
  const [showTicketsSheet, setShowTicketsSheet] = useState(false)
  const [showAssinaturaSheet, setShowAssinaturaSheet] = useState(false)
  
  // Extrair o chatId do card
  const chatId = card?.id || ''
  const contactName = card?.name || card?.nome || card?.contato?.nome || 'Contato'
  const contactNumber = chatId.replace('@c.us', '').replace('@s.whatsapp.net', '')
  
  // 📸 Hook da foto de perfil - IGUAL AO CARD
  const { pictureUrl, isLoading: isLoadingPicture } = useChatPicture(chatId)
  const profileImage = card?.profilePictureUrl || pictureUrl
  
  // 📊 Hook dos indicadores
  const { counts, loading: loadingIndicators } = useKanbanIndicators(contactNumber)
  
  // Buscar mensagens quando abrir o modal
  useEffect(() => {
    if (isOpen && chatId) {
      fetchMessages()
      // Criar objeto de chat para o ChatHeader
      setSelectedChat({
        id: chatId,
        name: contactName,
        profilePictureUrl: card?.profilePictureUrl || card?.avatar || null,
        isGroup: false,
        lastMessage: null,
        timestamp: Date.now(),
        numeroTelefone: contactNumber
      })
    }
  }, [isOpen, chatId])
  
  const fetchMessages = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      console.log('🔍 Buscando mensagens para:', chatId)
      
      // Usar a API da WAHA
      const response = await fetch(`/api/whatsapp/chats/${chatId}/messages?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📨 Mensagens recebidas:', data)
        
        // Transformar mensagens para o formato esperado pelo ChatArea - COM METADADOS COMPLETOS
        const transformedMessages = data.map((msg: any) => {
          // Determinar o tipo de mensagem baseado nos dados da WAHA
          let messageType = 'text'
          let metadata: any = {}
          
          // Detectar tipo baseado no conteúdo da mensagem WAHA
          if (msg.type === 'image' || msg.media?.mimetype?.startsWith('image/')) {
            messageType = 'image'
          } else if (msg.type === 'video' || msg.media?.mimetype?.startsWith('video/')) {
            messageType = 'video'
            metadata.thumbnailUrl = msg.media?.thumbnail
            metadata.duration = msg.media?.duration
          } else if (msg.type === 'audio' || msg.type === 'ptt' || msg.media?.mimetype?.startsWith('audio/')) {
            messageType = 'audio'
            metadata.duration = msg.media?.duration || msg.duration
          } else if (msg.type === 'document' || msg.media?.mimetype) {
            messageType = 'document'
            metadata.fileName = msg.media?.filename || msg.filename
            metadata.fileSize = msg.media?.filesize || msg.filesize
            metadata.mimeType = msg.media?.mimetype || msg.mimetype
          } else if (msg.type === 'location' || msg.location) {
            messageType = 'location'
            metadata.latitude = msg.location?.latitude || msg.lat
            metadata.longitude = msg.location?.longitude || msg.lng
            metadata.address = msg.location?.address || msg.address
            metadata.locationName = msg.location?.name || msg.locationName
          } else if (msg.type === 'contact' || msg.vcard) {
            messageType = 'contact'
            metadata.contactName = msg.contact?.name || msg.contactName
            metadata.phoneNumber = msg.contact?.phone || msg.phoneNumber
            metadata.email = msg.contact?.email
            metadata.organization = msg.contact?.organization
          } else if (msg.type === 'poll' || msg.poll) {
            messageType = 'poll'
            metadata.question = msg.poll?.name || msg.pollName
            metadata.pollOptions = msg.poll?.options || msg.pollOptions || []
            metadata.totalVotes = msg.poll?.totalVotes || 0
            metadata.allowMultipleAnswers = msg.poll?.multipleAnswers || false
          } else if (msg.type === 'list' || msg.list) {
            messageType = 'menu'
            metadata.menuTitle = msg.list?.title || msg.listTitle
            metadata.menuDescription = msg.list?.description || msg.listDescription
            metadata.menuItems = msg.list?.sections?.[0]?.rows || msg.listItems || []
          }
          
          return {
            id: msg.id || msg.messageId || `msg_${Date.now()}_${Math.random()}`,
            content: msg.text || msg.body || msg.message || msg.caption || '',
            sender: msg.fromMe ? 'assistant' : 'user',
            timestamp: new Date(msg.timestamp * 1000 || msg.createdAt || Date.now()).getTime(),
            type: messageType,
            status: msg.ack === 3 ? 'read' : msg.ack === 2 ? 'delivered' : msg.ack === 1 ? 'sent' : 'pending',
            mediaUrl: msg.mediaUrl || msg.media?.url || msg.url,
            metadata,
            quotedMsg: msg.quotedMsg || msg.quotedMessage,
            // Campos originais para compatibilidade
            text: msg.text || msg.body || msg.message || '',
            fromMe: msg.fromMe || false,
            from: msg.from || (msg.fromMe ? 'me' : chatId),
            to: msg.to || (msg.fromMe ? chatId : 'me'),
            ack: msg.ack || 0
          }
        })
        
        console.log('📨 Mensagens transformadas:', transformedMessages)
        setMessages(transformedMessages)
      } else {
        console.error('Erro na resposta:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSendMessage = async (message: string, attachments?: any[]) => {
    try {
      const sessionName = await getActiveSessionName()
      if (!sessionName) {
        console.error('❌ Nenhuma sessão ativa encontrada')
        return
      }
      
      // Adicionar assinatura do admin (igual ao atendimento)
      const userName = getUserName()
      const textWithSignature = `> *${userName}*\n\n${message}`
      
      console.log('📤 Enviando mensagem:', { chatId, message: textWithSignature, sessionName })
      
      // Usar o mesmo endpoint do atendimento - CORRETO!
      const response = await fetch(getWahaUrl('/api/sendText'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          session: sessionName,
          chatId: chatId,
          text: textWithSignature
        })
      })
      
      console.log('📤 Resposta do envio:', response.status, response.statusText)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Mensagem enviada:', result)
        // Recarregar mensagens após 1 segundo
        setTimeout(() => {
          fetchMessages()
        }, 1000)
      } else {
        const error = await response.text()
        console.error('❌ Erro no envio:', error)
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
    }
  }
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`flex h-[80vh] rounded-16xl shadow-1xl overflow-hidden transition-all duration-300 ${
        showProfileSidebar ? 'w-full max-w-7xl' : 'w-full max-w-4xl'
      }`}>
        {/* Modal Principal do Chat */}
        <div className={`flex flex-col overflow-hidden transition-all duration-300 ${
          showProfileSidebar ? 'w-2/3' : 'w-full'
        } ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} ${
          showProfileSidebar ? 'rounded-l-2xl rounded-tl-2xl rounded-bl-2xl' : 'rounded-2xl'
        }`}>
        
        {/* Header do Modal */}
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              {/* Foto do WAHA ou avatar fornecido - IGUAL KANBANCARD */}
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt={contactName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500" 
                /> 
              ) : null}
              
              {/* Fallback avatar com inicial */}
              <div className={`${profileImage ? 'hidden' : ''} w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold`}>
                {contactName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {contactName}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {contactNumber}
              </p>
            </div>
          </div>
          
          {/* Ações do Kanban */}
          <div className="flex items-center gap-2">
            {/* Perfil do Contato */}
            <button
              onClick={() => setShowProfileSidebar(true)}
              title="Ver Perfil"
              className={`p-2 rounded-lg transition-colors ${
                showProfileSidebar
                  ? theme === 'dark'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-blue-100 text-blue-700'
                  : theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCircle className="w-4 h-4" />
            </button>
            
            {/* Tags */}
            <button
              onClick={() => setShowTagsSheet(true)}
              title={`Gerenciar Tags${counts?.tags ? ` (${counts.tags})` : ''}`}
              className={`p-2 rounded-lg transition-colors relative ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Tag className="w-4 h-4" />
              {counts?.tags > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {counts.tags > 99 ? '99+' : counts.tags}
                </span>
              )}
            </button>
            
            {/* Orçamento */}
            <button
              onClick={() => setShowOrcamentoSheet(true)}
              title={`Criar Orçamento${counts?.orcamentos ? ` (${counts.orcamentos})` : ''}`}
              className={`p-2 rounded-lg transition-colors relative ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              {counts?.orcamentos > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {counts.orcamentos > 99 ? '99+' : counts.orcamentos}
                </span>
              )}
            </button>
            
            {/* Agendamento */}
            <button
              onClick={() => setShowAgendamentoSheet(true)}
              title={`Criar Agendamento${counts?.agendamentos ? ` (${counts.agendamentos})` : ''}`}
              className={`p-2 rounded-lg transition-colors relative ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {counts?.agendamentos > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {counts.agendamentos > 99 ? '99+' : counts.agendamentos}
                </span>
              )}
            </button>

            {/* Anotações */}
            <button
              onClick={() => setShowAnotacoesSheet(true)}
              title={`Gerenciar Anotações${counts?.anotacoes ? ` (${counts.anotacoes})` : ''}`}
              className={`p-2 rounded-lg transition-colors relative ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              {counts?.anotacoes > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {counts.anotacoes > 99 ? '99+' : counts.anotacoes}
                </span>
              )}
            </button>

            {/* Assinatura */}
            <button
              onClick={() => setShowAssinaturaSheet(true)}
              title="Gerenciar Assinatura"
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Tickets */}
            <button
              onClick={() => setShowTicketsSheet(true)}
              title={`Gerenciar Tickets${counts?.tickets ? ` (${counts.tickets})` : ''}`}
              className={`p-2 rounded-lg transition-colors relative ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Ticket className="w-4 h-4" />
              {counts?.tickets > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {counts.tickets > 99 ? '99+' : counts.tickets}
                </span>
              )}
            </button>

            
            {/* Separador */}
            <div className={`w-px h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
            
            {/* Fechar */}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400' 
                  : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Chat Header com informações do contato */}
        <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <ChatHeader 
            selectedChatId={chatId}
            theme={theme}
            onBack={() => {}}
            showBackButton={false}
          />
        </div>
        
        {/* Área de Mensagens com scroll customizado */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: ${columnColor}20;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: ${columnColor};
              border-radius: 4px;
              transition: background 0.3s ease;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${columnColor}dd;
            }
            .custom-scrollbar-colored::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar-colored::-webkit-scrollbar-track {
              background: var(--scrollbar-track);
              border-radius: 4px;
            }
            .custom-scrollbar-colored::-webkit-scrollbar-thumb {
              background: var(--scrollbar-thumb);
              border-radius: 4px;
              transition: background 0.3s ease;
            }
            .custom-scrollbar-colored::-webkit-scrollbar-thumb:hover {
              background: var(--scrollbar-thumb)dd;
            }
          `}</style>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : messages.length > 0 ? (
            <div 
              className="flex-1 overflow-y-auto custom-dynamic-scroll"
              style={{
                '--dynamic-color': columnColor
              } as React.CSSProperties}
            >
              <ChatArea 
                messages={messages}
                selectedChat={selectedChat}
                currentUserId="user"
                onLoadMore={() => {
                  // Implementar carregamento de mais mensagens
                  console.log('📜 Carregar mais mensagens...')
                }}
                hasMore={messages.length >= 50}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Nenhuma mensagem ainda
              </p>
            </div>
          )}
        </div>
        
        {/* Input de Mensagem - IGUAL AO ATENDIMENTO */}
        <div className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <MessageInput 
            chatId={chatId}
            onSendMessage={handleSendMessage}
            disabled={loading}
            onSendPoll={async (name: string, options: string[], multipleAnswers: boolean) => {
              if (!chatId) return
              const sessionName = await getActiveSessionName()
              if (!sessionName) return
              
              // Adicionar assinatura na enquete
              const userName = getUserName()
              const pollData = {
                name: `> *${userName}*\n\n${name}`,
                options,
                multipleAnswers
              }
              
              // Usar API WAHA para enviar enquete
              fetch(getWahaUrl('/api/sendPoll'), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  session: sessionName,
                  chatId: chatId,
                  poll: pollData
                })
              }).then(() => {
                console.log('📊 Enquete enviada')
                setTimeout(() => fetchMessages(), 500)
              })
            }}
            onSendMenu={async (title: string, description: string, options: string[]) => {
              if (!chatId) return
              const sessionName = await getActiveSessionName()
              if (!sessionName) return
              
              // Adicionar assinatura na lista
              const userName = getUserName()
              const listData = {
                title: title || 'Menu Interativo',
                description: `> *${userName}*\n\n${description || 'Escolha uma das op\u00e7\u00f5es abaixo'}`,
                footer: 'TappyOne CRM',
                button: 'Ver Op\u00e7\u00f5es',
                sections: [{
                  title: 'Principais',
                  rows: options.map((option, index) => ({
                    rowId: `option_${index + 1}`,
                    title: option,
                    description: null
                  }))
                }]
              }
              
              console.log('🔗 Enviando lista/menu:', listData)
              
              // Usar API WAHA para enviar lista/menu
              fetch(getWahaUrl('/api/sendList'), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  chatId: chatId,
                  session: sessionName,
                  message: listData,
                  reply_to: null
                })
              }).then(() => {
                console.log('✅ Lista enviada')
                setTimeout(() => fetchMessages(), 500)
              })
            }}
            onSendEvent={async (title: string, dateTime: string) => {
              if (!chatId) return
              const sessionName = await getActiveSessionName()
              if (!sessionName) return
              
              // Adicionar assinatura no evento
              const userName = getUserName()
              const startTime = dateTime ? Math.floor(new Date(dateTime).getTime() / 1000) : Math.floor(Date.now() / 1000)
              const eventData = {
                name: `> *${userName}*\n\n${title || 'Evento sem t\u00edtulo'}`,
                startTime: startTime,
                isCanceled: false,
                extraGuestsAllowed: true
              }
              
              // Usar API WAHA para enviar evento
              fetch(getWahaUrl(`/api/${sessionName}/events`), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  chatId: chatId,
                  event: eventData
                })
              }).then(() => {
                console.log('📅 Evento enviado')
                setTimeout(() => fetchMessages(), 500)
              })
            }}
            onSendContact={async (contactsData) => {
              if (!chatId) return
              const sessionName = await getActiveSessionName()
              if (!sessionName) return
              // Usar API WAHA para enviar contato
              fetch(getWahaUrl('/api/sendContactVcard'), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  session: sessionName,
                  chatId: chatId,
                  contacts: contactsData
                })
              }).then(() => {
                console.log('👤 Contato enviado')
                setTimeout(() => fetchMessages(), 500)
              })
            }}
            onSendLocation={async (locationData) => {
              if (!chatId) return
              const sessionName = await getActiveSessionName()
              if (!sessionName) return
              // Usar API WAHA para enviar localização
              fetch(getWahaUrl('/api/sendLocation'), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  session: sessionName,
                  chatId: chatId,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  name: locationData.name || '',
                  address: locationData.address || ''
                })
              }).then(() => {
                console.log('📍 Localização enviada')
                setTimeout(() => fetchMessages(), 500)
              })
            }}
            onSendMedia={async (file: File, caption: string, mediaType: 'image' | 'video' | 'document') => {
              console.log('📎 Enviando mídia:', { fileName: file.name, mediaType, caption })
              
              try {
                const sessionName = await getActiveSessionName()
                if (!sessionName) return
                
                // Converter arquivo para base64
                const reader = new FileReader()
                const base64Promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => {
                    const base64 = reader.result as string
                    resolve(base64.split(',')[1])
                  }
                })
                reader.readAsDataURL(file)
                const base64Data = await base64Promise
                
                // Determinar o endpoint correto
                let endpoint = '/api/sendImage'
                if (mediaType === 'video') {
                  endpoint = '/api/sendVideo'
                } else if (mediaType === 'document') {
                  endpoint = '/api/sendFile'
                }
                
                const response = await fetch(getWahaUrl(endpoint), {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({
                    session: sessionName,
                    chatId: chatId,
                    file: {
                      mimetype: file.type,
                      filename: file.name,
                      data: base64Data
                    },
                    caption: caption || ''
                  })
                })
                
                if (response.ok) {
                  console.log('✅ Mídia enviada')
                  setTimeout(() => fetchMessages(), 500)
                }
              } catch (error) {
                console.error('❌ Erro ao enviar mídia:', error)
              }
            }}
            onSendAudio={async (audioBlob: Blob) => {
              console.log('🎤 Enviando áudio...')
              
              try {
                // Converter áudio para base64
                const reader = new FileReader()
                const base64Promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => {
                    const base64 = reader.result as string
                    resolve(base64.split(',')[1])
                  }
                })
                reader.readAsDataURL(audioBlob)
                const base64Data = await base64Promise
                
                const sessionName = await getActiveSessionName()
                if (!sessionName) return
                
                const response = await fetch(getWahaUrl('/api/sendVoice'), {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({
                    session: sessionName,
                    chatId: chatId,
                    file: {
                      mimetype: 'audio/ogg; codecs=opus',
                      filename: `audio_${Date.now()}.ogg`,
                      data: base64Data
                    }
                  })
                })
                
                if (response.ok) {
                  console.log('✅ Áudio enviado')
                  setTimeout(() => fetchMessages(), 500)
                }
              } catch (error) {
                console.error('❌ Erro ao enviar áudio:', error)
              }
            }}
            onRespostaRapidaClick={() => {
              console.log('⚡ Abrindo respostas rápidas')
              setShowQuickActionsSidebar(true)
            }}
            onIAClick={() => {
              console.log('🤖 Abrindo resposta com I.A')
              setShowEditTextModal(true)
            }}
            onOpenEmojis={() => {
              console.log('😀 Abrindo emojis')
              setShowEmojisModal(true)
            }}
            onAcoesRapidasClick={() => {
              console.log('⚡ Abrindo ações rápidas')
              // TODO: Implementar ações rápidas
            }}
          />
        </div>

        {/* Componentes reais - IGUAL AO ATENDIMENTO */}
        {showEditTextModal && (
          <EditTextModal
            isOpen={showEditTextModal}
            onClose={() => setShowEditTextModal(false)}
            initialText=""
            contactName={contactName}
            actionTitle="Gerar com IA"
            onSend={async (message) => {
              // Enviar mensagem gerada pela IA
              if (chatId) {
                const sessionName = await getActiveSessionName()
                if (!sessionName) return
                fetch(getWahaUrl('/api/sendText'), {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({
                    session: sessionName,
                    chatId: chatId,
                    text: message
                  })
                }).then(() => {
                  console.log('🤖 Mensagem IA enviada')
                  setTimeout(() => fetchMessages(), 500)
                  setShowEditTextModal(false)
                })
              }
            }}
          />
        )}

        <QuickActionsSidebar
          isOpen={showQuickActionsSidebar}
          onClose={() => setShowQuickActionsSidebar(false)}
          activeChatId={chatId}
          onSelectAction={(action) => {
            // Executar ação rápida selecionada
            console.log('⚡ Ação rápida:', action)
            setShowQuickActionsSidebar(false)
          }}
        />

        {showEmojisModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Emojis</h3>
              <div className="grid grid-cols-6 gap-2 mb-4">
                {['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      handleSendMessage(emoji)
                      setShowEmojisModal(false)
                    }}
                    className="text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowEmojisModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
        
        </div>

        {/* ProfileSidebar Componentizado */}
        <ProfileSidebar
          isOpen={showProfileSidebar}
          onClose={() => setShowProfileSidebar(false)}
          theme={theme}
          contactName={contactName}
          contactNumber={contactNumber}
          chatId={chatId} // 🔑 Passando o chatId COMPLETO para buscar dados
          columnColor={columnColor} // 🎨 Passando a cor da coluna para scroll
          profileImage={profileImage} // 📸 Passando a foto de perfil
          counts={counts} // 📊 Passando os indicadores
          hasLeadEditOpen={showLeadEditSidebar} // 🎨 Para ajustar bordas
          onTagsClick={() => {
            setShowProfileSidebar(false)
            setShowTagsSheet(true)
          }}
          onOrcamentoClick={() => {
            setShowProfileSidebar(false)
            setShowOrcamentoSheet(true)
          }}
          onAgendamentoClick={() => {
            setShowProfileSidebar(false)
            setShowAgendamentoSheet(true)
          }}
          onTicketsClick={() => {
            setShowProfileSidebar(false)
            setShowTicketsSheet(true)
          }}
          onAnotacoesClick={() => {
            setShowProfileSidebar(false)
            setShowAnotacoesSheet(true)
          }}
          onAssinaturaClick={() => {
            setShowProfileSidebar(false)
            setShowAssinaturaSheet(true)
          }}
          onEditLead={() => setShowLeadEditSidebar(true)}
        />
        
        {/* LeadEditSidebar como extensão lateral */}
        {showLeadEditSidebar && (
          <LeadEditSidebar
            isOpen={showLeadEditSidebar}
            onClose={() => setShowLeadEditSidebar(false)}
            theme={theme}
            chatId={chatId}
          />
        )}
      </div>
      
      {/* Bottom Sheets */}
      {showAgendamentoSheet && (
        <AgendamentoBottomSheet 
          isOpen={showAgendamentoSheet}
          onClose={() => setShowAgendamentoSheet(false)}
          chatId={chatId}
        />
      )}

      {showOrcamentoSheet && (
        <OrcamentoBottomSheet 
          isOpen={showOrcamentoSheet}
          onClose={() => setShowOrcamentoSheet(false)}
          chatId={chatId}
        />
      )}

      {showTagsSheet && (
        <TagsBottomSheet 
          isOpen={showTagsSheet}
          onClose={() => setShowTagsSheet(false)}
          chatId={chatId}
        />
      )}

      {showAnotacoesSheet && (
        <AnotacoesBottomSheet 
          isOpen={showAnotacoesSheet}
          onClose={() => setShowAnotacoesSheet(false)}
          chatId={chatId}
        />
      )}

      {showTicketsSheet && (
        <TicketBottomSheet 
          isOpen={showTicketsSheet}
          onClose={() => setShowTicketsSheet(false)}
          chatId={chatId}
        />
      )}

      {showAssinaturaSheet && (
        <AssinaturaBottomSheet 
          isOpen={showAssinaturaSheet}
          onClose={() => setShowAssinaturaSheet(false)}
          chatId={chatId}
        />
      )}

    </div>
  )
}
