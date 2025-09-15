import { NextRequest, NextResponse } from 'next/server'

interface WhatsAppMessage {
  id: string
  from: string
  fromMe: boolean
  body: string
  timestamp: number
  type: string
}

async function checkAgentActive(chatId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/agentes-chat?contato_id=${chatId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.JWT_SECRET}`,
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.ativo ? data.agente : null
    }
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro ao verificar agente ativo:', error)
  }
  return null
}

async function generateAIResponse(message: WhatsAppMessage, agente: any, messageHistory: any[] = []) {
  try {
    console.log('🤖 [WEBHOOK] Gerando resposta IA para:', message.body.substring(0, 100))
    
    let systemPrompt = agente.prompt || agente.instrucoes || 'Você é um assistente IA útil.'
    
    if (agente.categoria) {
      systemPrompt = `Você é um especialista em ${agente.categoria}. ${systemPrompt}`
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/deepseek`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.JWT_SECRET}`
      },
      body: JSON.stringify({
        systemPrompt,
        messages: messageHistory.slice(-10),
        userMessage: message.body,
        temperature: parseFloat(agente.temperatura || '0.7'),
        max_tokens: parseInt(agente.max_tokens || '1000')
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.response
    }
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro ao gerar resposta IA:', error)
  }
  return null
}

async function sendWhatsAppMessage(chatId: string, message: string, sessionName: string) {
  try {
    console.log('📤 [WEBHOOK] Enviando resposta:', message.substring(0, 100))
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_WAHA_API_URL}/api/${sessionName}/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_WAHA_API_KEY || ''
      },
      body: JSON.stringify({
        chatId,
        text: message
      })
    })

    if (response.ok) {
      console.log('✅ [WEBHOOK] Mensagem enviada com sucesso')
      return true
    } else {
      console.error('❌ [WEBHOOK] Erro ao enviar mensagem:', response.status)
    }
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro ao enviar mensagem:', error)
  }
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionName = request.headers.get('X-Session-Name') || 'default'
    
    console.log('📨 [WEBHOOK] Evento recebido:', {
      session: sessionName,
      event: body.event,
      timestamp: new Date().toISOString()
    })

    // Processar diferentes tipos de eventos
    switch (body.event) {
      case 'session.status':
        console.log(`📊 [WEBHOOK] Status da sessão ${sessionName}:`, body.data.status)
        break
        
      case 'message':
      case 'message.any':
        const message: WhatsAppMessage = body.data
        
        // Só processar mensagens que NÃO são nossas (fromMe = false)
        if (!message.fromMe && message.body && message.body.trim().length > 0) {
          console.log('💬 [WEBHOOK] Nova mensagem do usuário:', {
            from: message.from,
            body: message.body.substring(0, 100),
            type: message.type
          })
          
          // Verificar se há agente ativo para este chat
          const agente = await checkAgentActive(message.from)
          
          if (agente) {
            console.log('🤖 [WEBHOOK] Agente ativo encontrado:', agente.nome)
            
            // Gerar resposta com IA
            const aiResponse = await generateAIResponse(message, agente)
            
            if (aiResponse) {
              // Aguardar um pouco para parecer natural
              setTimeout(async () => {
                await sendWhatsAppMessage(message.from, aiResponse, sessionName)
              }, Math.random() * 2000 + 1000) // 1-3 segundos
            }
          } else {
            console.log('😴 [WEBHOOK] Nenhum agente ativo para este chat')
          }
        } else {
          console.log('👤 [WEBHOOK] Mensagem ignorada (nossa mensagem ou vazia)')
        }
        break
        
      default:
        console.log('❓ [WEBHOOK] Evento desconhecido:', body.event)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('💥 [WEBHOOK] Erro no processamento:', error)
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
