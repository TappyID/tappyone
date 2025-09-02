'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { isAuthenticated, loading, user, login, getDashboardRoute } = useAuth()

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const dashboardRoute = getDashboardRoute(user.tipo)
      router.push(dashboardRoute)
    }
  }, [isAuthenticated, loading, user, router, getDashboardRoute])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#273155]"></div>
      </div>
    )
  }

  // Se já estiver autenticado, não mostrar a página de login
  if (isAuthenticated) {
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha: password }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Usar o hook para fazer login
        login(data.token, data.usuario)
        
        // Redirecionar para o dashboard apropriado
        const dashboardRoute = getDashboardRoute(data.usuario.tipo)
        router.push(dashboardRoute)
      } else {
        alert('Credenciais inválidas')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      alert('Erro interno do servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Form Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
          <CardHeader className="space-y-4 pb-6 pt-10 px-8">
            {/* Logo inside form */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-18 h-18 bg-gradient-to-br from-[#273155] to-[#1e2442] rounded-full mb-4 shadow-lg transform transition-transform duration-300 hover:rotate-3">
                <Image
                  src="/logologin.png"
                  alt="TappyOne CRM"
                  width={56}
                  height={56}
                  className="filter brightness-0 invert"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                Bem-vindo
              </CardTitle>
              <CardDescription className="text-gray-500 text-base font-medium">
                Entre com suas credenciais
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-[#273155]">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400 transition-all duration-200 group-focus-within:text-[#273155] group-focus-within:scale-110" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 border-2 border-gray-200 focus:border-[#273155] focus:ring-2 focus:ring-[#273155]/20 rounded-2xl text-base font-medium placeholder:text-gray-400 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 group">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-[#273155]">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 transition-all duration-200 group-focus-within:text-[#273155] group-focus-within:scale-110" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 border-2 border-gray-200 focus:border-[#273155] focus:ring-2 focus:ring-[#273155]/20 rounded-2xl text-base font-medium placeholder:text-gray-400 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-[#273155] transition-all duration-200 hover:scale-110 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#273155] bg-gray-100 border-gray-300 rounded focus:ring-[#273155] focus:ring-2 transition-colors"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 font-medium cursor-pointer">
                    Lembrar-me
                  </Label>
                </div>
                <a
                  href="#"
                  className="text-sm text-[#273155] hover:text-[#1e2442] font-semibold transition-all duration-200 hover:underline underline-offset-4"
                >
                  Esqueceu sua senha?
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#273155] to-[#1e2442] hover:from-[#1e2442] hover:to-[#273155] text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span className="animate-pulse">Entrando...</span>
                  </div>
                ) : (
                  <span className="group-hover:tracking-wider transition-all duration-200">Entrar</span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                Não tem uma conta?{' '}
                <a
                  href="#"
                  className="text-[#273155] hover:text-[#1e2442] font-semibold transition-all duration-200 hover:underline underline-offset-4"
                >
                  Entre em contato
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-400 font-medium">
          © 2024 TappyOne CRM. Todos os direitos reservados.
        </div>
      </div>
    </div>
  )
}
