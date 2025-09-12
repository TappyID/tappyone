import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8081'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const body = await request.json()
    const { chatId, ticketId, reason } = body

    // Log da tentativa de transferência
    console.log('🔄 [TRANSFER] Iniciando transferência:', {
      chatId,
      ticketId,
      reason,
      timestamp: new Date().toISOString()
    })

    const response = await fetch(`${BACKEND_URL}/api/tickets/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId,
        ticketId,
        reason,
        transferredAt: new Date().toISOString()
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [TRANSFER] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro na transferência: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    console.log('✅ [TRANSFER] Transferência realizada com sucesso:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Ticket transferido com sucesso',
      data
    })
  } catch (error) {
    console.error('❌ [TRANSFER] Erro na API de transferência:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor na transferência' },
      { status: 500 }
    )
  }
}
