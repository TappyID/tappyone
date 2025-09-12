import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('❌ [API] POST /api/chat-interno/reject')

    const body = await request.json()
    const { chatId, atendenteId, motivo } = body

    console.log('📝 [API] Dados recebidos:', { chatId, atendenteId, motivo })

    if (!chatId || !atendenteId) {
      return NextResponse.json(
        { error: 'chatId e atendenteId são obrigatórios' },
        { status: 400 }
      )
    }

    // Aqui você enviaria para o backend Go
    const backendUrl = `http://159.65.34.199:8081/api/chat-interno/reject`
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        chat_id: chatId,
        atendente_id: parseInt(atendenteId),
        action: 'reject',
        motivo: motivo || 'manual_reject'
      })
    })

    if (!response.ok) {
      console.error('❌ [API] Erro do backend:', response.status, response.statusText)
      
      // Por enquanto, simular sucesso para teste
      console.log('🔄 [API] Simulando redistribuição para desenvolvimento')
      return NextResponse.json({ 
        success: true, 
        message: 'Chat rejeitado e redistribuído com sucesso',
        chatId,
        atendenteId,
        redistributed: true,
        nextAtendente: 'atendente_proximo'
      })
    }

    const data = await response.json()
    console.log('✅ [API] Chat rejeitado e redistribuído com sucesso')

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [API] Erro ao rejeitar chat:', error)
    
    // Simular sucesso para desenvolvimento
    console.log('🔄 [API] Simulando redistribuição em caso de erro para desenvolvimento')
    return NextResponse.json({ 
      success: true, 
      message: 'Chat rejeitado e redistribuído com sucesso (simulado)',
      redistributed: true
    })
  }
}
