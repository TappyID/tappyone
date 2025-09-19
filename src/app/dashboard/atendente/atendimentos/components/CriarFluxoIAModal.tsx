'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Bot,
  Sparkles,
  MessageCircle,
  DollarSign,
  ShoppingCart,
  Headphones,
  UserPlus,
  Zap,
  Target,
  Gift,
  Coffee,
  Briefcase,
  Heart,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CriarFluxoIAModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateFluxo: (fluxoData: any) => Promise<void>
}

interface TipoFluxo {
  id: string
  titulo: string
  descricao: string
  icon: any
  color: string
  acoes: any[]
}

const tiposFluxo: TipoFluxo[] = [
  {
    id: 'vendas',
    titulo: 'Fluxo de Vendas',
    descricao: 'Sequência completa para converter leads em clientes',
    icon: ShoppingCart,
    color: 'from-green-500 to-emerald-600',
    acoes: [
      {
        tipo: 'texto',
        conteudo: { texto: '👋 Olá! Que bom ter você aqui!\n\nVi que você tem interesse nos nossos produtos. Vou te mostrar como podemos te ajudar!' },
        delay_segundos: 0,
        ordem: 0
      },
      {
        tipo: 'texto', 
        conteudo: { texto: '🎯 Temos soluções incríveis que podem revolucionar seu negócio:\n\n✅ Aumento de 300% na produtividade\n✅ Redução de 50% nos custos\n✅ Suporte 24/7 especializado\n\nQual dessas áreas mais te interessa?' },
        delay_segundos: 3,
        ordem: 1
      },
      {
        tipo: 'imagem',
        conteudo: { url: '', caption: '📊 Veja os resultados dos nossos clientes!' },
        delay_segundos: 5,
        ordem: 2
      },
      {
        tipo: 'texto',
        conteudo: { texto: '💰 OFERTA ESPECIAL:\n\n🔥 50% OFF no primeiro mês\n🎁 Configuração GRATUITA\n⚡ Implementação em 24h\n\nVálido apenas hoje! Que tal começarmos agora?' },
        delay_segundos: 2,
        ordem: 3
      },
      {
        tipo: 'pix',
        conteudo: { chave: 'vendas@empresa.com', valor: '497', descricao: 'Pagamento Plano Premium - 50% OFF' },
        delay_segundos: 1,
        ordem: 4
      }
    ]
  },
  {
    id: 'suporte',
    titulo: 'Fluxo de Suporte',
    descricao: 'Atendimento automatizado e eficiente',
    icon: Headphones,
    color: 'from-blue-500 to-cyan-600',
    acoes: [
      {
        tipo: 'texto',
        conteudo: { texto: '🛠️ Olá! Estou aqui para te ajudar!\n\nPara agilizar seu atendimento, preciso de algumas informações:' },
        delay_segundos: 0,
        ordem: 0
      },
      {
        tipo: 'texto',
        conteudo: { texto: '📋 Me conte:\n\n1️⃣ Qual produto/serviço?\n2️⃣ Qual problema está enfrentando?\n3️⃣ Quando começou?\n\nCom essas infos vou te dar a melhor solução!' },
        delay_segundos: 2,
        ordem: 1
      },
      {
        tipo: 'audio',
        conteudo: { url: '', arquivo_nome: 'tutorial-rapido.mp3' },
        delay_segundos: 5,
        ordem: 2
      },
      {
        tipo: 'texto',
        conteudo: { texto: '✅ Pronto! Sua solicitação foi registrada.\n\n⏰ Retorno em: 15 minutos\n📱 Protocolo: #SUP{timestamp}\n\nEnquanto isso, tem alguma dúvida rápida que posso esclarecer?' },
        delay_segundos: 3,
        ordem: 3
      }
    ]
  },
  {
    id: 'onboarding',
    titulo: 'Boas-vindas',
    descricao: 'Recepção perfeita para novos clientes',
    icon: UserPlus,
    color: 'from-purple-500 to-pink-600',
    acoes: [
      {
        tipo: 'texto',
        conteudo: { texto: '🎉 BEM-VINDO(A) À NOSSA FAMÍLIA!\n\nEstamos muito felizes em ter você conosco!' },
        delay_segundos: 0,
        ordem: 0
      },
      {
        tipo: 'video',
        conteudo: { url: '', caption: '🎬 Assista esse vídeo de boas-vindas especial!' },
        delay_segundos: 3,
        ordem: 1
      },
      {
        tipo: 'texto',
        conteudo: { texto: '📚 SEUS PRÓXIMOS PASSOS:\n\n1️⃣ Complete seu perfil\n2️⃣ Explore nossos recursos\n3️⃣ Fale com seu consultor\n4️⃣ Aproveite os benefícios!\n\nVamos começar?' },
        delay_segundos: 4,
        ordem: 2
      },
      {
        tipo: 'arquivo',
        conteudo: { url: '', filename: 'guia-primeiros-passos.pdf', caption: '📖 Seu guia completo para começar!' },
        delay_segundos: 2,
        ordem: 3
      }
    ]
  },
  {
    id: 'promocional',
    titulo: 'Fluxo Promocional',
    descricao: 'Campanhas irresistíveis que convertem',
    icon: Gift,
    color: 'from-orange-500 to-red-600',
    acoes: [
      {
        tipo: 'texto',
        conteudo: { texto: '🚨 ATENÇÃO! PROMOÇÃO IMPERDÍVEL!\n\n⚡ Apenas por tempo limitado!' },
        delay_segundos: 0,
        ordem: 0
      },
      {
        tipo: 'imagem',
        conteudo: { url: '', caption: '🔥 MEGA DESCONTO! Não perca essa oportunidade!' },
        delay_segundos: 2,
        ordem: 1
      },
      {
        tipo: 'texto',
        conteudo: { texto: '💸 ECONOMIZE R$ 500,00!\n\n✨ De R$ 997 por apenas R$ 497\n⏰ Restam apenas 6 horas\n🎁 + Bônus exclusivos\n\nSão só 10 vagas!' },
        delay_segundos: 3,
        ordem: 2
      },
      {
        tipo: 'texto',
        conteudo: { texto: '🤔 Ainda em dúvida?\n\n💯 Garantia de 30 dias\n🆓 Teste grátis por 7 dias\n📞 Suporte VIP incluso\n\nSeu investimento está protegido!' },
        delay_segundos: 4,
        ordem: 3
      },
      {
        tipo: 'pix',
        conteudo: { chave: 'promo@empresa.com', valor: '497', descricao: 'MEGA PROMOÇÃO - 50% OFF' },
        delay_segundos: 2,
        ordem: 4
      }
    ]
  },
  {
    id: 'agendamento',
    titulo: 'Agendamento',
    descricao: 'Converte contatos em reuniões',
    icon: Calendar,
    color: 'from-indigo-500 to-purple-600',
    acoes: [
      {
        tipo: 'texto',
        conteudo: { texto: '📅 Vamos agendar uma conversa?\n\nReunião de 30 minutos para entender suas necessidades e mostrar como podemos ajudar!' },
        delay_segundos: 0,
        ordem: 0
      },
      {
        tipo: 'texto',
        conteudo: { texto: '⏰ HORÁRIOS DISPONÍVEIS:\n\n🌅 Manhã: 9h às 12h\n☀️ Tarde: 14h às 17h\n🌙 Noite: 19h às 21h\n\nQual período funciona melhor para você?' },
        delay_segundos: 3,
        ordem: 1
      },
      {
        tipo: 'texto',
        conteudo: { texto: '✅ NOSSA REUNIÃO INCLUIRÁ:\n\n🎯 Análise do seu cenário atual\n💡 Estratégias personalizadas  \n📊 Demonstração prática\n🎁 Proposta exclusiva\n\nTudo sem compromisso!' },
        delay_segundos: 4,
        ordem: 2
      },
      {
        tipo: 'texto',
        conteudo: { texto: '🔗 CONFIRME SEU AGENDAMENTO:\n\nLink: [calendly.com/sua-empresa]\n\n📱 Ou responda com:\n- Seu nome completo\n- Melhor dia e horário\n- Telefone para contato' },
        delay_segundos: 2,
        ordem: 3
      }
    ]
  }
]

export default function CriarFluxoIAModal({
  isOpen,
  onClose,
  onCreateFluxo
}: CriarFluxoIAModalProps) {
  const [selectedFluxo, setSelectedFluxo] = useState<TipoFluxo | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleCreateFluxo = async (fluxo: TipoFluxo) => {
    setIsGenerating(true)
    
    try {
      const fluxoData = {
        titulo: `${fluxo.titulo} - Gerado por IA`,
        categoria_id: null, // Será definido automaticamente
        triggers: ['ia', 'automatico'],
        ativo: true,
        automatico: true,
        trigger_tipo: 'manual',
        delay_segundos: 0,
        repetir: false,
        acoes: fluxo.acoes.map(acao => ({
          ...acao,
          ativo: true,
          obrigatorio: true,
          condicional: false
        }))
      }

      await onCreateFluxo(fluxoData)
      onClose()
    } catch (error) {
      console.error('Erro ao criar fluxo:', error)
      alert('❌ Erro ao criar fluxo. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCustomFluxo = async () => {
    if (!customPrompt.trim()) return
    
    setIsGenerating(true)
    
    try {
      // Aqui futuramente integrar com IA real (OpenAI, Claude, etc.)
      const fluxoCustom: TipoFluxo = {
        id: 'custom',
        titulo: 'Fluxo Personalizado',
        descricao: customPrompt.substring(0, 50) + '...',
        icon: Sparkles,
        color: 'from-pink-500 to-violet-600',
        acoes: [
          {
            tipo: 'texto',
            conteudo: { texto: `🤖 Fluxo criado baseado em: "${customPrompt}"\n\nEste é um fluxo inicial que você pode personalizar!` },
            delay_segundos: 0,
            ordem: 0
          },
          {
            tipo: 'texto',
            conteudo: { texto: '✨ Personalize este fluxo:\n\n- Edite os textos\n- Adicione mídias\n- Configure delays\n- Ajuste a sequência\n\nVamos começar!' },
            delay_segundos: 3,
            ordem: 1
          }
        ]
      }

      await handleCreateFluxo(fluxoCustom)
    } catch (error) {
      console.error('Erro ao criar fluxo customizado:', error)
      alert('❌ Erro ao criar fluxo. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4"
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-violet-500 to-purple-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Criar Fluxo com IA</h2>
                  <p className="text-white/70 text-sm">Fluxos profissionais gerados automaticamente</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {!showCustom ? (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Escolha o tipo de fluxo:</h3>
                  <p className="text-muted-foreground text-sm">
                    Selecione um modelo pré-configurado que melhor atende suas necessidades
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {tiposFluxo.map((fluxo) => {
                    const Icon = fluxo.icon
                    return (
                      <motion.div
                        key={fluxo.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 border border-border rounded-lg cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => setSelectedFluxo(fluxo)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${fluxo.color}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{fluxo.titulo}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{fluxo.descricao}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Zap className="w-3 h-3" />
                              {fluxo.acoes.length} ações incluídas
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="border-t border-border pt-4">
                  <Button
                    onClick={() => setShowCustom(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ou crie um fluxo personalizado
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    onClick={() => setShowCustom(false)}
                    variant="ghost"
                    size="sm"
                  >
                    ← Voltar
                  </Button>
                  <h3 className="text-lg font-semibold">Fluxo Personalizado</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descreva o fluxo que você quer criar:
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ex: Fluxo para nutricionistas que vendem consultas online, incluindo apresentação dos serviços, depoimentos de clientes, oferta especial e agendamento..."
                    className="w-full h-32 p-3 border border-border rounded-lg bg-background text-foreground resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <Button
                  onClick={handleCustomFluxo}
                  disabled={!customPrompt.trim() || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 mr-2"
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      Gerando fluxo...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      Criar Fluxo Personalizado
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedFluxo && !showCustom && (
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Fluxo selecionado: {selectedFluxo.titulo}</h4>
                  <p className="text-sm text-muted-foreground">{selectedFluxo.acoes.length} ações serão criadas</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedFluxo(null)}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleCreateFluxo(selectedFluxo)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 mr-2"
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                        Criando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Criar Fluxo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
