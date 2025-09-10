import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

interface User {
  id: string
  nome: string
  email: string
  tipo: string
  ativo: boolean
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acesso livre às API routes do WhatsApp
  if (pathname.startsWith('/api/whatsapp/')) {
    return NextResponse.next()
  }

  // Permitir acesso livre às rotas públicas
  const publicRoutes = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register']
  if (publicRoutes.includes(pathname) || pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Verificar token
  const token = request.cookies.get('token')?.value || 
               request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    // Se não tem token e está tentando acessar rota protegida
    if (pathname.startsWith('/dashboard/')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  try {
    // Verificar o token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
    const { payload } = await jwtVerify(token, secret)
    const user = payload as User

    // Controle de acesso por rota e papel
    if (pathname.startsWith('/dashboard/admin/') && user.tipo !== 'ADMIN') {
      // Redirecionar para dashboard apropriado do usuário
      const userDashboard = getDashboardRoute(user.tipo)
      return NextResponse.redirect(new URL(userDashboard, request.url))
    }

    if (pathname.startsWith('/dashboard/atendente/') && 
        user.tipo !== 'ADMIN' && 
        !user.tipo.startsWith('ATENDENTE_')) {
      const userDashboard = getDashboardRoute(user.tipo)
      return NextResponse.redirect(new URL(userDashboard, request.url))
    }

    if (pathname.startsWith('/dashboard/assinante/') && 
        user.tipo !== 'ADMIN' && 
        user.tipo !== 'ASSINANTE' && 
        user.tipo !== 'AFILIADO') {
      const userDashboard = getDashboardRoute(user.tipo)
      return NextResponse.redirect(new URL(userDashboard, request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('❌ Erro no middleware:', error)
    // Token inválido, redirecionar para login
    if (pathname.startsWith('/dashboard/')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
}

function getDashboardRoute(userType: string): string {
  switch (userType) {
    case 'ADMIN':
      return '/dashboard/admin'
    case 'ATENDENTE_COMERCIAL':
    case 'ATENDENTE_FINANCEIRO':
    case 'ATENDENTE_JURIDICO':
    case 'ATENDENTE_SUPORTE':
    case 'ATENDENTE_VENDAS':
      return '/dashboard/atendente'
    case 'ASSINANTE':
    case 'AFILIADO':
      return '/dashboard/assinante'
    default:
      return '/login'
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
