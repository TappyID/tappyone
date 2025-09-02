import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'

export async function GET(request: NextRequest) {
  console.log('🚨 [ALERTAS] GET route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [ALERTAS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('📞 [ALERTAS] Fazendo requisição para backend:', `${BACKEND_URL}/api/alertas`)
    
    const response = await fetch(`${BACKEND_URL}/api/alertas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ [ALERTAS] Erro na resposta do backend:', response.status)
      return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [ALERTAS] Dados recebidos do backend:', data)
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [ALERTAS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🚨 [ALERTAS] POST route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [ALERTAS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const body = await request.json()
    
    console.log('📞 [ALERTAS] Criando alerta no backend:', body)
    
    const response = await fetch(`${BACKEND_URL}/api/alertas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('❌ [ALERTAS] Erro na resposta do backend:', response.status)
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [ALERTAS] Alerta criado com sucesso:', data)
    
    return NextResponse.json(data, { status: 201 })
    
  } catch (error) {
    console.error('❌ [ALERTAS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
