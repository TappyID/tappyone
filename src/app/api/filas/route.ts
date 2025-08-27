import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8081'

export async function GET(request: NextRequest) {
  console.log('📞 [FILAS] GET route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [FILAS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer "
    console.log('📞 [FILAS] Fazendo requisição para backend:', `${BACKEND_URL}/api/filas`)
    
    const response = await fetch(`${BACKEND_URL}/api/filas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ [FILAS] Erro na resposta do backend:', response.status)
      return NextResponse.json({ error: 'Erro ao buscar filas' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [FILAS] Dados recebidos do backend:', data)
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [FILAS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('📞 [FILAS] POST route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [FILAS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const body = await request.json()
    
    console.log('📞 [FILAS] Criando fila no backend:', body)
    
    const response = await fetch(`${BACKEND_URL}/api/filas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('❌ [FILAS] Erro na resposta do backend:', response.status)
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [FILAS] Fila criada com sucesso:', data)
    
    return NextResponse.json(data, { status: 201 })
    
  } catch (error) {
    console.error('❌ [FILAS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
