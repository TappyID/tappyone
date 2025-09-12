import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('📞 [FILAS] GET [id] route foi chamado para ID:', params.id)
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [FILAS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('📞 [FILAS] Fazendo requisição para backend:', `${BACKEND_URL}/api/filas/${params.id}`)
    
    const response = await fetch(`${BACKEND_URL}/api/filas/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ [FILAS] Erro na resposta do backend:', response.status)
      return NextResponse.json({ error: 'Erro ao buscar fila' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [FILAS] Fila recebida do backend:', data)
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [FILAS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('📞 [FILAS] PUT [id] route foi chamado para ID:', params.id)
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [FILAS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const body = await request.json()
    
    console.log('📞 [FILAS] Atualizando fila no backend:', body)
    
    const response = await fetch(`${BACKEND_URL}/api/filas/${params.id}`, {
      method: 'PUT',
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
    console.log('✅ [FILAS] Fila atualizada com sucesso:', data)
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [FILAS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('📞 [FILAS] DELETE [id] route foi chamado para ID:', params.id)
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [FILAS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    console.log('📞 [FILAS] Deletando fila no backend')
    
    const response = await fetch(`${BACKEND_URL}/api/filas/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      console.error('❌ [FILAS] Erro na resposta do backend:', response.status)
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [FILAS] Fila deletada com sucesso:', data)
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [FILAS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
