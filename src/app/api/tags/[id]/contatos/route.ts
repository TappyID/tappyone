import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📞 Proxy GET /api/tags/${params.id}/contatos - Buscando contatos da tag`)
    
    // Pegar o token de autorização
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log('🔑 Token encontrado:', authHeader.substring(0, 20) + '...')
    console.log('🏷️ Tag ID:', params.id)

    // Fazer requisição para o backend
    const response = await fetch(`${BACKEND_URL}/api/tags/${params.id}/contatos`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 Response do backend:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Erro do backend:', errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status} - ${errorText}` }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Contatos da tag encontrados:', data?.length || 0)
    console.log('🔍 Estrutura da resposta:', JSON.stringify(data, null, 2))
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro no proxy tags/contatos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
