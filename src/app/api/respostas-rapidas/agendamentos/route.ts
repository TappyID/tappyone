import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📅 [AGENDAMENTO] Criando agendamento:', body)

    const response = await fetch(`${BACKEND_URL}/api/respostas-rapidas/agendamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [AGENDAMENTO] Erro do backend:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ [AGENDAMENTO] Criado com sucesso:', data)
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [AGENDAMENTO] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/respostas-rapidas/agendamentos`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [AGENDAMENTO] Erro ao listar:', error)
    return NextResponse.json(
      { error: 'Erro ao listar agendamentos' },
      { status: 500 }
    )
  }
}
