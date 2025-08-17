import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          TappyOne CRM
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema CRM completo com WhatsApp, Kanban e IA
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">
              Fazer Login
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Ver Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📱 WhatsApp
            </CardTitle>
            <CardDescription>
              Integração completa com WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Conexão via QR Code</li>
              <li>• Envio e recebimento de mensagens</li>
              <li>• Suporte a mídias</li>
              <li>• Webhooks em tempo real</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Kanban
            </CardTitle>
            <CardDescription>
              Sistema de gestão visual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Quadros personalizáveis</li>
              <li>• Drag & drop</li>
              <li>• Cards com conversas</li>
              <li>• Agentes de IA por coluna</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 IA Integrada
            </CardTitle>
            <CardDescription>
              Respostas automáticas inteligentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• DeepSeek API</li>
              <li>• Agentes personalizáveis</li>
              <li>• Prompts configuráveis</li>
              <li>• Respostas contextuais</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💬 Chat Interno
            </CardTitle>
            <CardDescription>
              Comunicação da equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Chat em tempo real</li>
              <li>• Sistema de atendimento</li>
              <li>• Respostas rápidas</li>
              <li>• Histórico completo</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📅 Agendamentos
            </CardTitle>
            <CardDescription>
              Gestão de compromissos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Calendário integrado</li>
              <li>• Notificações automáticas</li>
              <li>• Status de acompanhamento</li>
              <li>• Integração com contatos</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Gestão Financeira
            </CardTitle>
            <CardDescription>
              Controle de cobrança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PIX, cartão e boleto</li>
              <li>• Planos e assinaturas</li>
              <li>• Dashboard financeiro</li>
              <li>• Controle de vencimentos</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Pronto para começar?
        </p>
        <Link href="/login">
          <Button size="lg" className="bg-whatsapp-green hover:bg-whatsapp-dark">
            Começar Agora
          </Button>
        </Link>
      </div>
    </div>
  )
}
