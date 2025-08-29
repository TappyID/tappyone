import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'https://server.tappy.id'

export async function GET(request: NextRequest) {
  console.log('📋 [KANBAN QUADROS] GET route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [KANBAN QUADROS] Token não encontrado no header')
    }

    console.log('🔑 [KANBAN QUADROS] Token encontrado')
    console.log('📡 [KANBAN QUADROS] Fazendo chamada para backend:', `${BACKEND_URL}/api/kanban/quadros`)

    const response = await fetch(`${BACKEND_URL}/api/kanban/quadros`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 [KANBAN QUADROS] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [KANBAN QUADROS] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [KANBAN QUADROS] Quadros obtidos com sucesso, total:', data.length || 0)
    
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('❌ [KANBAN QUADROS] Erro na API proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('📋 [KANBAN QUADROS] POST route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [KANBAN QUADROS] Token não encontrado no header')
      return NextResponse.json(
        { error: 'Token de autorização não encontrado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove "Bearer "
    const body = await request.json()
    console.log('📋 [KANBAN QUADROS] Body parseado para criação de quadro')

    console.log('📋 [KANBAN QUADROS] Enviando POST para backend:', `${BACKEND_URL}/api/kanban/quadros`)

    const response = await fetch(`${BACKEND_URL}/api/kanban/quadros`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 [KANBAN QUADROS] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [KANBAN QUADROS] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [KANBAN QUADROS] Quadro criado com sucesso')
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('❌ [KANBAN QUADROS] Erro na API proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
