'use client'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { card_ids } = await request.json()
    
    if (!card_ids || !Array.isArray(card_ids)) {
      return NextResponse.json(
        { error: 'card_ids é obrigatório e deve ser um array' },
        { status: 400 }
      )
    }

    // Obter token de autorização
    const authorization = request.headers.get('authorization')
    if (!authorization) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      )
    }

    console.log('🤖 [API] Iniciando busca batch de agentes para cards:', card_ids)

    // Fazer requisição para o backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
    const response = await fetch(`${backendUrl}/api/agentes/batch`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ card_ids })
    })

    console.log('🤖 [API] Response do backend - Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🤖 [API] Erro do backend:', errorText)
      return NextResponse.json(
        { error: 'Erro ao buscar agentes do backend' },
        { status: response.status }
      )
    }

    const agentesData = await response.json()
    console.log('🤖 [API] Agentes retornados:', Object.keys(agentesData).length, 'cards')
    
    return NextResponse.json(agentesData)
  } catch (error) {
    console.error('🤖 [API] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
