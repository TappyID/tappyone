import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('👥 [USERS API] GET route foi chamado!')
  
  try {
    const { searchParams } = new URL(request.url)
    console.log('👥 [USERS API] Parâmetros:', Object.fromEntries(searchParams))
    
    // Extrair token do header Authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [USERS API] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }
    
    console.log('👥 [USERS API] Token extraído do header')
    
    // Construir URL do backend com os parâmetros
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users?${searchParams.toString()}`
    console.log('👥 [USERS API] Enviando para backend:', backendUrl)
    
    // Fazer requisição para o backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })
    
    console.log('📡 [USERS API] Status da resposta do backend:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ [USERS API] Erro do backend:', errorText)
      return NextResponse.json(
        { error: 'Erro ao buscar usuários' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ [USERS API] Dados dos usuários obtidos com sucesso, total:', Array.isArray(data) ? data.length : 'não é array')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ [USERS API] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('👥 [USERS API] POST route foi chamado!')
  
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [USERS API] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }
    
    const body = await request.json()
    console.log('👥 [USERS API] Dados recebidos para criar usuário:', { ...body, senha: '[OCULTA]' })
    
    // Construir URL do backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users`
    console.log('👥 [USERS API] Enviando para backend:', backendUrl)
    
    // Fazer requisição para o backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    console.log('📡 [USERS API] Status da resposta do backend:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ [USERS API] Erro do backend:', errorText)
      return NextResponse.json(
        { error: 'Erro ao criar usuário' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ [USERS API] Usuário criado com sucesso')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ [USERS API] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
