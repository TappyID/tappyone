import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    console.log(`🔍 [API] Buscando contato por chatId: ${params.id}`)

    const response = await fetch(`${backendUrl}/api/contatos/${encodeURIComponent(params.id)}`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      }
    })

    console.log(`📡 [API] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`❌ [API] Erro do backend: ${response.status} - ${errorText}`)
      return NextResponse.json({ error: `Erro do backend: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    console.log(`✅ [API] Contato encontrado - Tags:`, data.tags?.length || 0)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [API] Erro ao buscar contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${backendUrl}/api/contatos/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao atualizar contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const response = await fetch(`${backendUrl}/api/contatos/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authorization,
      }
    })

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json({ message: 'Contato deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
