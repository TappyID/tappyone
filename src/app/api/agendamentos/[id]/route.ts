import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Pegar token JWT dos headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Converter campos do frontend para backends
    const backendBody = {
      ...body,
      // Se há data, converter para inicioEm (formato camelCase que o backend Go espera)
      ...(body.data && body.hora_inicio && {
        inicioEm: `${body.data}T${body.hora_inicio}:00-03:00`
      }),
      // Se há data e hora_fim, converter para fimEm
      ...(body.data && body.hora_fim && {
        fimEm: `${body.data}T${body.hora_fim}:00-03:00`
      })
    }

    console.log('🚀 BODY ORIGINAL:', JSON.stringify(body, null, 2))
    console.log('🎯 BACKEND BODY:', JSON.stringify(backendBody, null, 2))


    const response = await fetch(`${BACKEND_URL}/api/agendamentos/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro na API de agendamentos PUT:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Pegar token JWT dos headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log('Excluindo agendamento:', id)

    const response = await fetch(`${BACKEND_URL}/api/agendamentos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API de agendamentos DELETE:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
