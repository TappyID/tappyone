'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  ArrowRight,
  Shield,
  Award,
  Clock,
  Users,
  Star,
  Download,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const footerLinks = {
  produtos: [
    { name: 'WhatsApp Business', href: '#', description: 'API oficial integrada' },
    { name: 'Chatbots IA', href: '#', description: 'Agentes inteligentes' },
    { name: 'Kanban CRM', href: '#', description: 'Gestão visual' },
    { name: 'Agendamentos', href: '#', description: 'Calendário integrado' },
    { name: 'Pagamentos', href: '#', description: 'PIX e cartão' },
    { name: 'Automação', href: '#', description: 'Fluxos inteligentes' }
  ],
  solucoes: [
    { name: 'E-commerce', href: '#', description: 'Vendas online' },
    { name: 'Imobiliárias', href: '#', description: 'Gestão de leads' },
    { name: 'Consultórios', href: '#', description: 'Agendamentos médicos' },
    { name: 'Educação', href: '#', description: 'Gestão de alunos' },
    { name: 'Serviços', href: '#', description: 'Atendimento profissional' },
    { name: 'Varejo', href: '#', description: 'Vendas presenciais' }
  ],
  recursos: [
    { name: 'API Developers', href: '#', description: 'Documentação técnica' },
    { name: 'Integrações', href: '#', description: 'Conecte suas ferramentas' },
    { name: 'Templates', href: '#', description: 'Modelos prontos' },
    { name: 'Webhooks', href: '#', description: 'Automação avançada' },
    { name: 'Analytics', href: '#', description: 'Relatórios detalhados' },
    { name: 'Mobile App', href: '#', description: 'iOS e Android' }
  ],
  suporte: [
    { name: 'Central de Ajuda', href: '#', description: 'Documentação completa' },
    { name: 'Status do Sistema', href: '#', description: 'Monitoramento em tempo real' },
    { name: 'Comunidade', href: '#', description: 'Fórum de usuários' },
    { name: 'Treinamentos', href: '#', description: 'Cursos e certificações' },
    { name: 'Consultoria', href: '#', description: 'Implementação especializada' },
    { name: 'Suporte 24/7', href: '#', description: 'Atendimento premium' },

  ]
}

const stats = [
  { label: 'Empresas Ativas', value: '10,000+', icon: Users },
  { label: 'Mensagens/Mês', value: '50M+', icon: MessageSquare },
  { label: 'Uptime', value: '99.9%', icon: Clock },
  { label: 'Satisfação', value: '4.9/5', icon: Star }
]

const certifications = [
  { name: 'ISO 27001', description: 'Segurança da Informação' },
  { name: 'LGPD', description: 'Proteção de Dados' },
  { name: 'WhatsApp Partner', description: 'Parceiro Oficial' },
  { name: 'SOC 2', description: 'Auditoria de Segurança' }
]

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%227%22%20cy%3D%2227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%227%22%20cy%3D%2247%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2247%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2247%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-500/20 to-transparent rounded-full blur-3xl" />

      <div className="relative">
        {/* Newsletter Section */}
        <div className="border-b border-white/10">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                  Fique por dentro das novidades
                </h2>
                <p className="text-xl text-gray-300 mb-8 font-light leading-relaxed">
                  Receba atualizações sobre novos recursos, dicas de uso e cases de sucesso
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 font-medium"
                  />
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Mail className="w-4 h-4 mr-2" />
                    Inscrever
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-b border-white/10">
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mb-4">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">TappyOne</h3>
                    <p className="text-gray-300 text-sm font-medium tracking-wide">CRM Intelligence</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed text-sm font-light">
                  A plataforma de CRM mais avançada do Brasil para gestão de conversas WhatsApp, 
                  com IA integrada, automação inteligente e ferramentas completas para vendas.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium">São Paulo, SP - Brasil</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200">
                    <Phone className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium">+55 (11) 9999-9999</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium">contato@tappyone.com</span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-14">
                  {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, index) => (
                    <motion.a
                      key={index}
                      href="#"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Links Sections */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-bold mb-7 capitalize text-white tracking-tight pl-3">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href}
                        className="group flex items-start space-x-2 text-gray-300 hover:text-white transition-all duration-200 p-2 rounded-lg hover:bg-white/5"
                      >
                        <ChevronRight className="w-4 h-4 mt-0.5 text-blue-400 group-hover:translate-x-1 transition-transform duration-200" />
                        <div>
                          <div className="font-semibold text-sm">{link.name}</div>
                          <div className="text-xs text-gray-400 font-light">{link.description}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
             
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {certifications.map((cert, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-lg mb-3">
                      <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h5 className="font-medium text-white mb-1">{cert.name}</h5>
                    <p className="text-xs text-gray-400">{cert.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-400 text-sm">
                <p>&copy; 2024 TappyOne. Todos os direitos reservados.</p>
                <div className="flex space-x-6">
                  <Link href="#" className="hover:text-white transition-colors">
                    Política de Privacidade
                  </Link>
                  <Link href="#" className="hover:text-white transition-colors">
                    Termos de Uso
                  </Link>
                  <Link href="#" className="hover:text-white transition-colors">
                    LGPD
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Todos os sistemas operacionais</span>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
