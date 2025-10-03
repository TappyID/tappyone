import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { chatId: string; tagId: string } }
) {
  console.log('📞 [DELETE TAG] route foi chamado para chatId:', params.chatId, 'tagId:', params.tagId)
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [DELETE TAG] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const url = `${BACKEND_URL}/api/chats/${encodeURIComponent(params.chatId)}/tags/${params.tagId}`
    console.log('📞 [DELETE TAG] Removendo tag no backend:', url)
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ [DELETE TAG] Erro na resposta do backend:', response.status)
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [DELETE TAG] Tag removida com sucesso:', data)
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [DELETE TAG] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
