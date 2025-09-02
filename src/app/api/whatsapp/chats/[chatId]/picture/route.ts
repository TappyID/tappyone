import { NextRequest, NextResponse } from 'next/server'

// WAHA API para fotos de perfil (porta 3001)
const WAHA_API_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001/api'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    console.log('🖼️ [CHAT PICTURE] GET route chamado para chatId:', params.chatId)
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [CHAT PICTURE] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Extrair user ID do token para sessão WAHA
    const token = authHeader.replace('Bearer ', '')
    let userId = '1' // fallback
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]))
      userId = tokenPayload.userId || tokenPayload.id || '1'
    } catch {
      console.log('⚠️ [CHAT PICTURE] Não foi possível extrair userId do token, usando fallback')
    }

    const sessionName = `user_${userId}`
    console.log('📡 [CHAT PICTURE] Fazendo chamada para WAHA API:', `${WAHA_API_URL}/${sessionName}/chats/${params.chatId}/picture`)

    // Chamar WAHA API diretamente para fotos de perfil
    const response = await fetch(`${WAHA_API_URL}/${sessionName}/chats/${params.chatId}/picture`, {
      method: 'GET',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 [CHAT PICTURE] Status da resposta da WAHA API:', response.status)

    if (!response.ok) {
      console.log('⚠️ [CHAT PICTURE] Foto não encontrada ou erro na WAHA API:', response.status)
      // Retornar resposta vazia em caso de erro (foto não encontrada é normal)
      return NextResponse.json({ url: null })
    }

    const data = await response.json()
    console.log('✅ [CHAT PICTURE] Foto obtida da WAHA API')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [CHAT PICTURE] Erro interno:', error)
    return NextResponse.json(
      { url: null },
      { status: 200 } // Retornar 200 com url null em caso de erro
    )
  }
}
