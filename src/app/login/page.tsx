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
import { useTheme } from '@/contexts/ThemeContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const router = useRouter()
  const { isAuthenticated, loading, user, login, getDashboardRoute } = useAuth()
  const { theme } = useTheme()

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    const wasRemembered = localStorage.getItem('rememberMe') === 'true'
    
    if (savedEmail && savedPassword && wasRemembered) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setRememberMe(true)
      console.log('✅ Credenciais carregadas do localStorage:', { email: savedEmail })
    } else {
      console.log('ℹ️ Nenhuma credencial salva encontrada')
    }
  }, [])

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
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 to-slate-800'
          : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
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
        
        // Salvar ou limpar credenciais baseado no "Lembrar-me"
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
          localStorage.setItem('rememberedPassword', password)
          localStorage.setItem('rememberMe', 'true')
          console.log('✅ Credenciais salvas no localStorage')
        } else {
          localStorage.removeItem('rememberedEmail')
          localStorage.removeItem('rememberedPassword')
          localStorage.removeItem('rememberMe')
          console.log('🗑️ Credenciais removidas do localStorage')
        }
        
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      })

      if (response.ok) {
        setForgotSuccess(true)
      } else {
        alert('Erro ao enviar email de recuperação')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro interno do servidor')
    } finally {
      setForgotLoading(false)
    }
  }

  const resetForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotEmail('')
    setForgotSuccess(false)
    setForgotLoading(false)
  }

  // Limpar credenciais salvas quando desmarcar o checkbox
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked)
    
    if (!checked) {
      // Se desmarcar, limpar imediatamente do localStorage
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('rememberedPassword')
      localStorage.removeItem('rememberMe')
      console.log('🗑️ Credenciais removidas (checkbox desmarcado)')
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="w-full max-w-md">
        {/* Form Card */}
        <Card 
          className="shadow-2xl border-0 rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl relative"
          style={theme === 'dark' ? {
            background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(55, 65, 81, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 20px 40px -12px rgba(31, 41, 55, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          } : {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Glass effect layers for dark mode */}
          {theme === 'dark' && (
            <>
              {/* Base glass layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-900/20 to-slate-800/40 rounded-3xl" />
              
              {/* Blue accent layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 rounded-3xl" />
              
              {/* Light reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-3xl" />
              
              {/* Subtle border */}
              <div className="absolute inset-0 rounded-3xl border border-white/10" />
            </>
          )}
          
          {/* Content wrapper */}
          <div className="relative z-10">
          <CardHeader className="space-y-4 pb-6 pt-10 px-8">
            {/* Logo inside form */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-8">
                <Image
                  src={theme === 'dark' ? "/logo-branca.svg" : "/logo.svg"}
                  alt="TappyOne CRM"
                  width={400}
                  height={120}
                  className="max-w-full h-auto"
                />
              </div>
            </div>
            {!showForgotPassword && (
              <motion.div 
                className="text-center space-y-2"
                initial={{ opacity: 1 }}
                animate={{ opacity: showForgotPassword ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <CardTitle className={`text-2xl font-bold tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Bem-vindo ao TappyOne 
                </CardTitle>
                <CardDescription className={`text-base font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Entre com suas credenciais de acesso
                </CardDescription>
              </motion.div>
            )}
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {!showForgotPassword ? (
              <div>
                <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2 group">
                <Label htmlFor="email" className={`text-sm font-semibold transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 group-focus-within:text-blue-400' 
                    : 'text-gray-700 group-focus-within:text-[#273155]'
                }`}>
                  Email
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-4 h-5 w-5 transition-all duration-200 group-focus-within:scale-110 ${
                    theme === 'dark' 
                      ? 'text-gray-500 group-focus-within:text-blue-400' 
                      : 'text-gray-400 group-focus-within:text-[#273155]'
                  }`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-12 h-14 border-2 focus:border-[#273155] focus:ring-2 focus:ring-[#273155]/20 rounded-2xl text-base font-medium transition-all duration-300 ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-slate-700/50 text-white placeholder:text-gray-400 hover:border-gray-500 focus:bg-slate-700'
                        : 'border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:bg-white'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 group">
                <Label htmlFor="password" className={`text-sm font-semibold transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 group-focus-within:text-blue-400' 
                    : 'text-gray-700 group-focus-within:text-[#273155]'
                }`}>
                  Senha
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-4 h-5 w-5 transition-all duration-200 group-focus-within:scale-110 ${
                    theme === 'dark' 
                      ? 'text-gray-500 group-focus-within:text-blue-400' 
                      : 'text-gray-400 group-focus-within:text-[#273155]'
                  }`} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-12 pr-12 h-14 border-2 focus:border-[#273155] focus:ring-2 focus:ring-[#273155]/20 rounded-2xl text-base font-medium transition-all duration-300 ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-slate-700/50 text-white placeholder:text-gray-400 hover:border-gray-500 focus:bg-slate-700'
                        : 'border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:bg-white'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-4 hover:text-[#273155] transition-all duration-200 hover:scale-110 focus:outline-none ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}
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
                    onChange={(e) => handleRememberMeChange(e.target.checked)}
                    className="w-4 h-4 text-[#273155] bg-gray-100 border-gray-300 rounded focus:ring-[#273155] focus:ring-2 transition-colors cursor-pointer"
                  />
                  <Label htmlFor="remember" className={`text-sm font-medium cursor-pointer ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Lembrar-me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className={`font-semibold transition-all duration-200 hover:underline underline-offset-4 ${
                    theme === 'dark'
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-[#273155] hover:text-[#1e2442]'
                  }`}
                >
                  Esqueceu sua senha?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full h-14 font-bold text-lg rounded-2xl transition-all duration-500 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden ${
                  theme === 'dark'
                    ? 'text-white'
                    : 'bg-gradient-to-r from-[#273155] to-[#1e2442] hover:from-[#1e2442] hover:to-[#273155] text-white hover:shadow-xl'
                }`}
                style={theme === 'dark' ? {
                  background: 'linear-gradient(135deg, rgba(48, 94, 115, 0.8) 0%, rgba(58, 109, 132, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: '0 20px 40px -12px rgba(48, 94, 115, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                } : {}}
              >
                {/* Glass effect layers for dark mode */}
                {theme === 'dark' && (
                  <>
                    {/* Base glass layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-2xl" />
                    
                    {/* Blue accent layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 rounded-2xl" />
                    
                    {/* Light reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                    
                    {/* Animated border glow */}
                    <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                  </>
                )}
                {isLoading ? (
                  <div className="flex items-center justify-center relative z-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span className="animate-pulse">Entrando...</span>
                  </div>
                ) : (
                  <span className="group-hover:tracking-wider transition-all duration-200 relative z-10">Entrar</span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className={`mt-6 pt-4 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <p className={`text-center text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Não tem uma conta?{' '}
                <a
                  href="#"
                  className={`font-semibold transition-all duration-200 hover:underline underline-offset-4 ${
                    theme === 'dark'
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-[#273155] hover:text-[#1e2442]'
                  }`}
                >
                  Entre em contato
                </a>
              </p>
                </div>
              </div>
            ) : (
              /* Forgot Password Form */
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                {!forgotSuccess ? (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="text-center space-y-2 mb-6">
                      <h3 className={`text-xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Recuperar Senha
                      </h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Digite seu email para receber o código de recuperação
                      </p>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2 group">
                      <Label htmlFor="forgot-email" className={`text-sm font-semibold transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-300 group-focus-within:text-blue-400' 
                          : 'text-gray-700 group-focus-within:text-[#273155]'
                      }`}>
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className={`absolute left-4 top-4 h-5 w-5 transition-all duration-200 group-focus-within:scale-110 ${
                          theme === 'dark' 
                            ? 'text-gray-500 group-focus-within:text-blue-400' 
                            : 'text-gray-400 group-focus-within:text-[#273155]'
                        }`} />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className={`pl-12 h-14 border-2 focus:border-[#273155] focus:ring-2 focus:ring-[#273155]/20 rounded-2xl text-base font-medium transition-all duration-300 ${
                            theme === 'dark'
                              ? 'border-gray-600 bg-slate-700/50 text-white placeholder:text-gray-400 hover:border-gray-500 focus:bg-slate-700'
                              : 'border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:bg-white'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={forgotLoading}
                        className={`w-full h-14 font-bold text-lg rounded-2xl transition-all duration-500 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden ${
                          theme === 'dark'
                            ? 'text-white'
                            : 'bg-gradient-to-r from-[#273155] to-[#1e2442] hover:from-[#1e2442] hover:to-[#273155] text-white hover:shadow-xl'
                        }`}
                        style={theme === 'dark' ? {
                          background: 'linear-gradient(135deg, rgba(48, 94, 115, 0.8) 0%, rgba(58, 109, 132, 0.9) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          boxShadow: '0 20px 40px -12px rgba(48, 94, 115, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        } : {}}
                      >
                        {/* Glass effect layers for dark mode */}
                        {theme === 'dark' && (
                          <>
                            {/* Base glass layer */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-2xl" />
                            
                            {/* Blue accent layer */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 rounded-2xl" />
                            
                            {/* Light reflection */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                            
                            {/* Animated border glow */}
                            <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
                            
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                          </>
                        )}
                        {forgotLoading ? (
                          <div className="flex items-center justify-center relative z-10">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            <span className="animate-pulse">Enviando...</span>
                          </div>
                        ) : (
                          <span className="relative z-10">Enviar Código</span>
                        )}
                      </Button>

                      <Button
                        type="button"
                        onClick={resetForgotPassword}
                        variant="outline"
                        className={`w-full h-12 border-2 font-semibold rounded-2xl transition-all duration-300 ${
                          theme === 'dark'
                            ? 'border-gray-600 hover:border-blue-400/50 text-gray-300 hover:text-blue-400 hover:bg-slate-700/30'
                            : 'border-gray-200 hover:border-[#273155] text-gray-600 hover:text-[#273155] hover:bg-gray-50'
                        }`}
                      >
                        Voltar ao Login
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Success Message */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-6"
                  >
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                      theme === 'dark'
                        ? 'bg-green-900/30 border border-green-500/30'
                        : 'bg-green-100'
                    }`}>
                      <svg className={`w-10 h-10 ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Email Enviado!
                      </h3>
                      <p className={`text-sm leading-relaxed ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Verifique sua caixa de entrada em <strong>{forgotEmail}</strong>.<br/>
                        Você receberá um código e link para redefinir sua senha.
                      </p>
                    </div>

                    <Button
                      onClick={resetForgotPassword}
                      variant="outline"
                      className={`w-full h-12 border-2 font-semibold rounded-2xl transition-all duration-300 ${
                        theme === 'dark'
                          ? 'border-gray-600 hover:border-blue-400/50 text-gray-300 hover:text-blue-400 hover:bg-slate-700/30'
                          : 'border-gray-200 hover:border-[#273155] text-gray-600 hover:text-[#273155] hover:bg-gray-50'
                      }`}
                    >
                      Voltar ao Login
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </CardContent>
          </div>
        </Card>

        {/* Footer */}
        <div className={`text-center mt-6 text-xs font-medium ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          © 2024 TappyOne CRM. Todos os direitos reservados.
        </div>
      </div>
    </div>
  )
}
