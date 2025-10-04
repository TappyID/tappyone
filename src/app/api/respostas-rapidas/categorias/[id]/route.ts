import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    
    console.log('📋 [CATEGORIAS] PUT - Atualizando categoria:', id, body)

    const response = await fetch(`${BACKEND_URL}/api/respostas-rapidas/categorias/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [CATEGORIAS] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [CATEGORIAS] Categoria atualizada:', data)
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [CATEGORIAS] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const { id } = params
    
    console.log('📋 [CATEGORIAS] DELETE - Deletando categoria:', id)

    const response = await fetch(`${BACKEND_URL}/api/respostas-rapidas/categorias/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [CATEGORIAS] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      )
    }

    console.log('✅ [CATEGORIAS] Categoria deletada')
    
    // Backend Go retorna 204 No Content ao deletar
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }
    
    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [CATEGORIAS] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar categoria' },
      { status: 500 }
    )
  }
}
