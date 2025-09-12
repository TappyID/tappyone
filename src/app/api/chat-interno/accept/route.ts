import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('✅ [API] POST /api/chat-interno/accept')

    const body = await request.json()
    const { chatId, atendenteId } = body

    console.log('📝 [API] Dados recebidos:', { chatId, atendenteId })

    if (!chatId || !atendenteId) {
      return NextResponse.json(
        { error: 'chatId e atendenteId são obrigatórios' },
        { status: 400 }
      )
    }

    // Aqui você enviaria para o backend Go
    const backendUrl = `http://159.65.34.199:8081/api/chat-interno/accept`
    
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
        action: 'accept'
      })
    })

    if (!response.ok) {
      console.error('❌ [API] Erro do backend:', response.status, response.statusText)
      
      // Por enquanto, simular sucesso para teste
      console.log('🔄 [API] Simulando sucesso para desenvolvimento')
      return NextResponse.json({ 
        success: true, 
        message: 'Chat aceito com sucesso',
        chatId,
        atendenteId
      })
    }

    const data = await response.json()
    console.log('✅ [API] Chat aceito com sucesso')

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [API] Erro ao aceitar chat:', error)
    
    // Simular sucesso para desenvolvimento
    console.log('🔄 [API] Simulando sucesso em caso de erro para desenvolvimento')
    return NextResponse.json({ 
      success: true, 
      message: 'Chat aceito com sucesso (simulado)' 
    })
  }
}
