import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messageId, chatId, session = 'default' } = await request.json()
    
    if (!messageId || !chatId) {
      return NextResponse.json({ 
        error: 'messageId e chatId são obrigatórios' 
      }, { status: 400 })
    }

    // Chamar WAHA API diretamente para star message
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_URL || 'http://159.65.34.199:3001/'
    const wahaToken = process.env.WAHA_API_KEY || 'your-api-key'
    
    console.log('⭐ Favoritando mensagem via WAHA:', { messageId, chatId })

    const response = await fetch(`${wahaUrl}/api/${session}/messages/${messageId}/star`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': wahaToken
      },
      body: JSON.stringify({
        star: true
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro WAHA star:', response.status, errorText)
      return NextResponse.json({ 
        error: 'Erro ao favoritar mensagem', 
        details: errorText 
      }, { status: response.status })
    }

    const result = await response.json()
    console.log('✅ Mensagem favoritada com sucesso')

    return NextResponse.json({
      success: true,
      messageId,
      starred: true,
      ...result
    })

  } catch (error) {
    console.error('💥 Erro ao favoritar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { messageId, chatId, session = 'default' } = await request.json()
    
    if (!messageId || !chatId) {
      return NextResponse.json({ 
        error: 'messageId e chatId são obrigatórios' 
      }, { status: 400 })
    }

    // Chamar WAHA API diretamente para unstar message
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_URL || 'http://159.65.34.199:3001/'
    const wahaToken = process.env.WAHA_API_KEY || 'your-api-key'
    
    console.log('⭐ Removendo favorito via WAHA:', { messageId, chatId })

    const response = await fetch(`${wahaUrl}/api/${session}/messages/${messageId}/star`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': wahaToken
      },
      body: JSON.stringify({
        star: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro WAHA unstar:', response.status, errorText)
      return NextResponse.json({ 
        error: 'Erro ao remover favorito', 
        details: errorText 
      }, { status: response.status })
    }

    const result = await response.json()
    console.log('✅ Favorito removido com sucesso')

    return NextResponse.json({
      success: true,
      messageId,
      starred: false,
      ...result
    })

  } catch (error) {
    console.error('💥 Erro ao remover favorito:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
