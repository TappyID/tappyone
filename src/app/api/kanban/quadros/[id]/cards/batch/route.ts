import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Função para verificar token
async function verifyToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, secret) as any
    return decoded
  } catch (error) {
    return null
  }
}

// POST /api/kanban/quadros/[id]/cards/batch - Criar múltiplos cards de uma vez
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = await verifyToken(token)

    if (!decoded || !decoded.user_id) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    const quadroId = params.id
    const body = await request.json()
    const { cards } = body

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: 'Array de cards é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`📝 [API] Criando ${cards.length} cards em batch para quadro ${quadroId}`)

    // Verificar se o quadro existe
    const quadro = await prisma.kanbanQuadro.findUnique({
      where: { id: quadroId }
    })

    if (!quadro) {
      return NextResponse.json(
        { error: 'Quadro não encontrado' },
        { status: 404 }
      )
    }

    // Validar se as colunas existem
    const colunaIdsSet = new Set(cards.map((c: any) => c.colunaId))
    const colunaIds = Array.from(colunaIdsSet)
    const colunas = await prisma.kanbanColuna.findMany({
      where: {
        id: { in: colunaIds },
        quadroId: quadroId
      }
    })

    if (colunas.length !== colunaIds.length) {
      return NextResponse.json(
        { error: 'Uma ou mais colunas não pertencem ao quadro' },
        { status: 400 }
      )
    }

    // Criar os cards em batch
    const cardsParaCriar = cards.map((card: any) => ({
      conversaId: card.conversaId,
      colunaId: card.colunaId,
      posicao: card.posicao || 0,
      criadoPor: decoded.user_id
    }))

    // Usar createMany para criar todos de uma vez
    const resultado = await prisma.kanbanCard.createMany({
      data: cardsParaCriar,
      skipDuplicates: true // Ignorar duplicados
    })

    console.log(`✅ [API] ${resultado.count} cards criados com sucesso`)

    // Buscar os cards criados para retornar
    const conversaIds = cards.map((c: any) => c.conversaId)
    const cardsRiados = await prisma.kanbanCard.findMany({
      where: {
        conversaId: { in: conversaIds },
        coluna: {
          quadroId: quadroId
        }
      },
      include: {
        coluna: true
      },
      orderBy: {
        posicao: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      count: resultado.count,
      cards: cardsRiados
    })
  } catch (error: any) {
    console.error('❌ [API] Erro ao criar cards em batch:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cards', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
