import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

interface User {
  user_id: string
  email: string
  role: string  // Campo correto vindo do JWT backend
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log(`[MIDDLEWARE] Processando: ${pathname}`)

  // Permitir acesso livre às API routes do WhatsApp
  if (pathname.startsWith('/api/whatsapp/')) {
    console.log(`[MIDDLEWARE] ✅ API WhatsApp permitida: ${pathname}`)
    return NextResponse.next()
  }

  // Permitir acesso livre às rotas públicas
  const publicRoutes = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register']
  if (publicRoutes.includes(pathname) || pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
    console.log(`[MIDDLEWARE] ✅ Rota pública permitida: ${pathname}`)
    return NextResponse.next()
  }

  // Verificar token
  const token = request.cookies.get('token')?.value || 
               request.headers.get('authorization')?.replace('Bearer ', '')

  console.log(`[MIDDLEWARE] Token encontrado: ${token ? 'SIM' : 'NÃO'} para ${pathname}`)

  if (!token) {
    // Se não tem token e está tentando acessar rota protegida
    if (pathname.startsWith('/dashboard/')) {
      console.log(`[MIDDLEWARE] 🚫 Sem token, redirecionando para login: ${pathname}`)
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  try {
    // Verificar o token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
    const { payload } = await jwtVerify(token, secret)
    const user = payload as unknown as User

    console.log(`[MIDDLEWARE] 📋 Usuário autenticado: ${user.email} (${user.role}) acessando ${pathname}`)

    // Controle de acesso por rota e papel
    if (pathname.startsWith('/dashboard/admin/') && user.role !== 'ADMIN') {
      console.log(`[MIDDLEWARE] 🚫 ACESSO NEGADO: ${user.role} tentando acessar admin: ${pathname}`)
      // Redirecionar para dashboard apropriado do usuário
      const userDashboard = getDashboardRoute(user.role)
      return NextResponse.redirect(new URL(userDashboard, request.url))
    }

    if (pathname.startsWith('/dashboard/atendente/') && 
        user.role !== 'ADMIN' && 
        !user.role.startsWith('ATENDENTE_')) {
      console.log(`[MIDDLEWARE] 🚫 ACESSO NEGADO: ${user.role} tentando acessar atendente: ${pathname}`)
      const userDashboard = getDashboardRoute(user.role)
      return NextResponse.redirect(new URL(userDashboard, request.url))
    }

    if (pathname.startsWith('/dashboard/assinante/') && 
        user.role !== 'ADMIN' && 
        user.role !== 'ASSINANTE' && 
        user.role !== 'AFILIADO') {
      console.log(`[MIDDLEWARE] 🚫 ACESSO NEGADO: ${user.role} tentando acessar assinante: ${pathname}`)
      const userDashboard = getDashboardRoute(user.role)
      return NextResponse.redirect(new URL(userDashboard, request.url))
    }

    console.log(`[MIDDLEWARE] ✅ ACESSO PERMITIDO: ${user.role} pode acessar ${pathname}`)
    return NextResponse.next()
  } catch (error) {
    console.error(`[MIDDLEWARE] ❌ Erro ao verificar token para ${pathname}:`, error)
    // Token inválido, redirecionar para login
    if (pathname.startsWith('/dashboard/')) {
      console.log(`[MIDDLEWARE] 🚫 Token inválido, redirecionando para login: ${pathname}`)
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
