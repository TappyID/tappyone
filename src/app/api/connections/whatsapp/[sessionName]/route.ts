import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest, { params }: { params: { sessionName: string } }) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const response = await fetch(`${backendUrl}/api/connections/whatsapp/${params.sessionName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authorization,
      }
    })

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json({ message: 'Conexão WhatsApp removida com sucesso' })
  } catch (error) {
    console.error('Erro ao remover conexão WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
