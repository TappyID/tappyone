import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { nome } = body

    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
    }

    // Proxy para o backend Go
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081'
    const response = await fetch(`${backendUrl}/api/users/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome: nome.trim() })
    })

    const responseText = await response.text()
    console.log('📥 [API] Resposta do backend:', responseText)

    if (!response.ok) {
      console.error('❌ [API] Erro do backend (status', response.status, '):', responseText)
      try {
        const error = JSON.parse(responseText)
        return NextResponse.json(error, { status: response.status })
      } catch {
        return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: response.status })
      }
    }

    try {
      const data = JSON.parse(responseText)
      return NextResponse.json(data)
    } catch (parseError) {
      console.error('❌ [API] Erro ao parsear JSON:', parseError)
      console.error('❌ [API] Texto recebido:', responseText)
      return NextResponse.json({ error: 'Resposta inválida do servidor' }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ [API] Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}
