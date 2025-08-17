import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userID = request.headers.get('X-User-ID')
    
    console.log('WhatsApp Webhook received:', {
      userID,
      event: body.event,
      data: body.data,
      timestamp: new Date().toISOString()
    })

    // Processar diferentes tipos de eventos
    switch (body.event) {
      case 'session.status':
        console.log(`Session status changed: ${body.data.status}`)
        // Aqui você pode atualizar o status da sessão no banco de dados
        break
        
      case 'message':
        console.log('New message received:', body.data)
        // Aqui você pode processar mensagens recebidas
        break
        
      case 'message.any':
        console.log('Any message event:', body.data)
        break
        
      default:
        console.log('Unknown event type:', body.event)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'WhatsApp webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
