import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'

export async function GET(request: NextRequest) {
  try {
    console.log('📞 Proxy GET /api/contatos - Buscando contatos do backend')
    
    // Pegar o token de autorização
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log('🔑 Token encontrado:', authHeader.substring(0, 20) + '...')

    // Fazer requisição para o backend
    const response = await fetch(`${BACKEND_URL}/api/contatos`, {
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
    console.log('✅ Contatos encontrados:', data?.length || 0)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro no proxy contatos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📞 Proxy POST /api/contatos - Criando contato no backend')
    
    const body = await request.json()
    console.log('📝 Body parseado:', JSON.stringify(body, null, 2))
    
    // Pegar o token de autorização
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log('🔑 Token encontrado:', authHeader.substring(0, 20) + '...')

    // Fazer requisição para o backend
    const response = await fetch(`${BACKEND_URL}/api/contatos`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
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
    console.log('✅ Contato criado:', data?.id || 'N/A')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro no proxy contatos POST:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
