import { NextRequest, NextResponse } from 'next/server'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:8081'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionName: string } }
) {
  try {
    const { sessionName } = params
    
    // Primeiro verificar se a sessão já existe
    const existingSessionsResponse = await fetch(`${WAHA_URL}/api/sessions`, {
      method: 'GET',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'accept': 'application/json'
      }
    })

    if (existingSessionsResponse.ok) {
      const sessions = await existingSessionsResponse.json()
      const existingSession = sessions.find((s: any) => s.name === sessionName)
      
      if (existingSession) {
        // Sessão já existe, verificar se está ativa
        if (existingSession.status === 'WORKING') {
          return NextResponse.json({
            message: 'Sessão já está ativa',
            session: existingSession
          })
        } else if (existingSession.status === 'STARTING') {
          return NextResponse.json({
            message: 'Sessão já está sendo iniciada',
            session: existingSession
          })
        }
        
        // Sessão existe mas não está ativa, tentar reativar
        const restartResponse = await fetch(`${WAHA_URL}/api/sessions/${sessionName}/restart`, {
          method: 'POST',
          headers: {
            'X-Api-Key': WAHA_API_KEY,
            'Content-Type': 'application/json',
            'accept': 'application/json'
          }
        })
        
        if (restartResponse.ok) {
          const data = await restartResponse.json()
          return NextResponse.json(data)
        }
      }
    }

    // Criar nova sessão
    const wahaUrl = `${WAHA_URL}/api/sessions`
    
    const sessionConfig = {
      name: sessionName,
      config: {
        proxy: null,
        webhooks: [
          {
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://crm.tappy.id'}/api/whatsapp/webhook`,
            events: ['message', 'session.status']
          }
        ]
      }
    }
    
    const response = await fetch(wahaUrl, {
      method: 'POST',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(sessionConfig)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [SESSION ${sessionName} START] Erro do WAHA:`, response.status, errorText)
      
      // Se for erro 422, sessão já existe - tentar com PUT para atualizar
      if (response.status === 422) {
        console.log(`🔄 [SESSION ${sessionName} START] Sessão já existe, tentando PUT para atualizar...`)
        
        const updateResponse = await fetch(`${WAHA_URL}/api/sessions/${sessionName}`, {
          method: 'PUT',
          headers: {
            'X-Api-Key': WAHA_API_KEY,
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify(sessionConfig.config)
        })
        
        if (updateResponse.ok) {
          const updateData = await updateResponse.json()
          console.log(`✅ [SESSION ${sessionName} START] Sessão atualizada com sucesso`)
          return NextResponse.json(updateData)
        } else {
          const updateErrorText = await updateResponse.text()
          console.error(`❌ [SESSION ${sessionName} START] Erro ao atualizar sessão:`, updateResponse.status, updateErrorText)
        }
        
        return NextResponse.json(
          { 
            error: 'Sessão já existe e falha ao atualizar', 
            details: errorText,
            suggestion: 'Tente parar a sessão existente primeiro'
          },
          { status: 422 }
        )
      }
      
      return NextResponse.json(
        { error: `Erro do WAHA: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error(`❌ [SESSION ${params.sessionName} START] Erro interno:`, error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
