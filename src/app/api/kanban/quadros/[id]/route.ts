import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(' [KANBAN QUADRO ID] GET route foi chamado para ID:', params.id)
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(' [KANBAN QUADRO ID] Token não encontrado no header')
      return NextResponse.json(
        { error: 'Token de autorização não encontrado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log(' [KANBAN QUADRO ID] Token extraído do header')

    const backendUrl = `${BACKEND_URL}/api/kanban/quadros/${params.id}`
    console.log(' [KANBAN QUADRO ID] Enviando para backend:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(' [KANBAN QUADRO ID] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(' [KANBAN QUADRO ID] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(' [KANBAN QUADRO ID] Quadro obtido com sucesso')
    
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(' [KANBAN QUADRO ID] Erro na API proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(' [KANBAN QUADRO ID] PUT route foi chamado para ID:', params.id)
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(' [KANBAN QUADRO ID] Token não encontrado no header')
      return NextResponse.json(
        { error: 'Token de autorização não encontrado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const body = await request.json()
    console.log(' [KANBAN QUADRO ID] Body parseado para atualização de quadro')

    const backendUrl = `${BACKEND_URL}/api/kanban/quadros/${params.id}`
    console.log(' [KANBAN QUADRO ID] Enviando PUT para backend:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log(' [KANBAN QUADRO ID] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(' [KANBAN QUADRO ID] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(' [KANBAN QUADRO ID] Quadro atualizado com sucesso')
    
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(' [KANBAN QUADRO ID] Erro na API proxy:', error)
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
  console.log(' [KANBAN QUADRO ID] DELETE route foi chamado para ID:', params.id)
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(' [KANBAN QUADRO ID] Token não encontrado no header')
      return NextResponse.json(
        { error: 'Token de autorização não encontrado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log(' [KANBAN QUADRO ID] Token extraído do header')

    const backendUrl = `${BACKEND_URL}/api/kanban/quadros/${params.id}`
    console.log(' [KANBAN QUADRO ID] Enviando DELETE para backend:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(' [KANBAN QUADRO ID] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(' [KANBAN QUADRO ID] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    console.log(' [KANBAN QUADRO ID] Quadro deletado com sucesso')
    
    return NextResponse.json({ message: 'Quadro deletado com sucesso' }, { status: 200 })
  } catch (error) {
    console.error(' [KANBAN QUADRO ID] Erro na API proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
