import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:8081'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [SESSIONS] GET iniciado')
    
    // Validar token JWT
    const authorization = request.headers.get('authorization')
    console.log('🔍 [SESSIONS] Authorization header:', authorization ? `Bearer ${authorization.split(' ')[1]?.substring(0, 20)}...` : 'AUSENTE')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      console.log('🚫 [SESSIONS] Header de autorização ausente ou inválido')
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const token = authorization.split(' ')[1]
    console.log('🔍 [SESSIONS] Token extraído:', token.substring(0, 20) + '...')
    console.log('🔍 [SESSIONS] JWT_SECRET configurado:', JWT_SECRET ? 'SIM' : 'NÃO')
    
    let userID: string
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      console.log('🔍 [SESSIONS] Token decodificado:', { 
        user_id: decoded.user_id, 
        email: decoded.email,
        exp: decoded.exp,
        iat: decoded.iat 
      })
      
      userID = decoded.user_id
      
      if (!userID) {
        console.log('🚫 [SESSIONS] user_id não encontrado no token')
        return NextResponse.json({ error: 'Token inválido - user_id ausente' }, { status: 401 })
      }
      
      console.log(`🔑 [SESSIONS] Token validado para userID: ${userID}`)
    } catch (error) {
      console.error('🚫 [SESSIONS] Erro na validação JWT:', error)
      console.error('🚫 [SESSIONS] JWT_SECRET usado:', JWT_SECRET)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const wahaUrl = `${WAHA_URL}/api/sessions`
    
    const response = await fetch(wahaUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ [SESSIONS] Erro do WAHA:', response.status)
      return NextResponse.json(
        { error: `Erro do WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const allSessions = await response.json()
    
    // Filtrar sessões pelo usuário logado
    // Remove hífens do userID para comparar com o formato da sessão WAHA
    const userIDClean = userID.replace(/-/g, '')
    const userPrefix = `user_${userIDClean.substring(0, 8)}`
    
    const userSessions = allSessions.filter((session: any) => 
      session.name && session.name.startsWith(userPrefix)
    )
    
    console.log(`📊 [SESSIONS] UserID: ${userID}, UserPrefix: ${userPrefix}, Total sessions: ${allSessions.length}, User sessions: ${userSessions.length}`)
    
    return NextResponse.json(userSessions)
  } catch (error) {
    console.error('❌ [SESSIONS] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const wahaUrl = `${WAHA_URL}/api/sessions`
    
    const response = await fetch(wahaUrl, {
      method: 'POST',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('❌ [SESSIONS POST] Erro do WAHA:', response.status)
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Erro do WAHA: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [SESSIONS POST] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
