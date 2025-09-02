import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido' }, { status: 401 })
    }

    console.log(' [API ROUTE] Atualizando tag:', { id: params.id, nome: body.nome })
    const response = await fetch(`${BACKEND_URL}/api/tags/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(' [API ROUTE] Erro do backend ao atualizar tag:', { status: response.status, error })
      return NextResponse.json({ error: 'Erro ao atualizar tag' }, { status: response.status })
    }

    const data = await response.json()
    console.log(' [API ROUTE] Tag atualizada com sucesso:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error(' Erro na API de tags:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido' }, { status: 401 })
    }

    console.log(' [API ROUTE] Deletando tag:', { id: params.id })
    const response = await fetch(`${BACKEND_URL}/api/tags/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(' [API ROUTE] Erro do backend ao deletar tag:', { status: response.status, error })
      return NextResponse.json({ error: 'Erro ao deletar tag' }, { status: response.status })
    }

    console.log(' [API ROUTE] Tag deletada com sucesso')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(' Erro na API de tags:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
