import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    console.log('🗑️ [RESPOSTAS-RAPIDAS] DELETE - ID:', id)
    
    const response = await fetch(`${BACKEND_URL}/api/respostas-rapidas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 [RESPOSTAS-RAPIDAS] DELETE Status do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ [RESPOSTAS-RAPIDAS] DELETE Erro do backend:', errorText)
      return NextResponse.json(
        { error: errorText || 'Failed to delete resposta rapida' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting resposta rapida:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    console.log('✏️ [RESPOSTAS-RAPIDAS] PUT - ID:', id, 'Body:', body)
    
    const response = await fetch(`${BACKEND_URL}/api/respostas-rapidas/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 [RESPOSTAS-RAPIDAS] PUT Status do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ [RESPOSTAS-RAPIDAS] PUT Erro do backend:', errorText)
      return NextResponse.json(
        { error: errorText || 'Failed to update resposta rapida' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating resposta rapida:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
