import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'
const JWT_SECRET = process.env.JWT_SECRET || 'tappyone_jwt_secret_2024_secure_key_a8f9e2d1c5b7f3e6a4d8c9b2e5f1a7d3'

interface JwtPayload {
  userId: string
  email: string
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: JwtPayload

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch (jwtError) {
      console.error('❌ Token inválido:', jwtError)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Extrair cardIds do body
    const { cardIds } = await request.json()
    
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json({}, { status: 200 })
    }

    console.log('🚀 Batch Assinaturas - cardIds:', cardIds.length)

    // Buscar assinaturas para todos os cards de uma vez
    const assinaturasResponse = await fetch(`${BACKEND_URL}/api/assinaturas/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-ID': decoded.userId
      },
      body: JSON.stringify({ 
        cardIds,
        userId: decoded.userId 
      })
    })

    if (!assinaturasResponse.ok) {
      console.error('❌ Erro no backend assinaturas batch:', assinaturasResponse.status)
      return NextResponse.json({}, { status: 200 }) // Retorna vazio em caso de erro
    }

    const assinaturasData = await assinaturasResponse.json()
    console.log('✅ Batch Assinaturas OK:', Object.keys(assinaturasData).length, 'cards')

    return NextResponse.json(assinaturasData)

  } catch (error) {
    console.error('❌ Erro na API batch assinaturas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
