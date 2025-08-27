import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8081'

export async function GET(request: NextRequest) {
  console.log('👥 [USUARIOS] GET route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [USUARIOS] Token não encontrado no header')
      return NextResponse.json(
        { error: 'Token de autorização não encontrado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove "Bearer "
    console.log('👥 [USUARIOS] Token extraído do header')
    console.log('👥 [USUARIOS] Enviando para backend:', `${BACKEND_URL}/api/users`)

    const response = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 [USUARIOS] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [USUARIOS] Erro do backend:', response.status, errorText)
      
      // Se for 404, retornar lista vazia ao invés de erro
      if (response.status === 404) {
        console.log('👥 [USUARIOS] Endpoint não implementado, retornando lista vazia')
        return NextResponse.json([])
      }
      
      return NextResponse.json(
        { error: `Erro do backend: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [USUARIOS] Usuários obtidos com sucesso, total:', data.length || 0)
    
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('❌ [USUARIOS] Erro na API proxy:', error)
    // Retornar lista vazia em caso de erro para não quebrar a interface
    return NextResponse.json([])
  }
}
