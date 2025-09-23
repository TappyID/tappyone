import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const response = await fetch(`${backendUrl}/api/kanban/${params.id}/metadata`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar metadata do kanban:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const body = await request.json()
    
    console.log('📋 [API] Enviando metadata para backend:', {
      url: `${backendUrl}/api/kanban/${params.id}/metadata`,
      body: JSON.stringify(body, null, 2)
    })

    const response = await fetch(`${backendUrl}/api/kanban/${params.id}/metadata`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    // Verificar se a resposta é JSON antes de parsear
    const contentType = response.headers.get('content-type')
    let data
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      // Se não for JSON, pegar como texto
      const text = await response.text()
      console.log('Resposta não-JSON do backend:', text)
      
      // Se a resposta for OK mas não JSON, retornar sucesso
      if (response.ok) {
        data = { success: true, message: 'Metadata salva com sucesso' }
      } else {
        data = { error: text || 'Erro ao salvar metadata' }
      }
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao salvar metadata do kanban:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // PUT também usa POST no backend
  return POST(request, { params })
}
