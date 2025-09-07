'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const urlCode = searchParams.get('code')

  useEffect(() => {
    if (urlCode) {
      setCode(urlCode)
    }
    if (!email) {
      router.push('/login')
    }
  }, [urlCode, email, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao redefinir senha')
      }
    } catch (error) {
      setError('Erro interno do servidor')
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
          <CardHeader className="space-y-4 pb-6 pt-10 px-8">
            {/* Logo */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-8">
                <Image
                  src="/logo.svg"
                  alt="TappyOne CRM"
                  width={300}
                  height={90}
                  className="dark:hidden max-w-full h-auto"
                />
                <Image
                  src="/logo-branca.svg"
                  alt="TappyOne CRM"
                  width={300}
                  height={90}
                  className="hidden dark:block max-w-full h-auto"
                />
              </div>
            </div>

            {!success ? (
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                  Redefinir Senha
                </CardTitle>
                <CardDescription className="text-gray-500 text-base font-medium">
                  Digite o código recebido e sua nova senha
                </CardDescription>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold text-green-600 tracking-tight">
                  Senha Atualizada!
                </CardTitle>
                <CardDescription className="text-gray-500 text-base font-medium">
                  Redirecionando para o login...
                </CardDescription>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {!success ? (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Code Field */}
                <div className="space-y-2 group">
                  <Label htmlFor="code" className="text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-[#273155]">
                    Código de Verificação
                  </Label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-4 h-5 w-5 text-gray-400 transition-all duration-200 group-focus-within:text-[#273155] group-focus-within:scale-110" />
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="pl-12 h-14 border-2 border-gray-200 focus:border-[#273155] focus:ring-2 focus:ring-[#273155]/20 rounded-2xl text-base font-medium placeholder:text-gray-400 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 focus:bg-white text-center tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                {/* New Password Field */}
                <div className="space-y-2 group">
                  <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-[#273155]">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 transition-all duration-200 group-focus-within:text-[#273155] group-focus-within:scale-110" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                {/* Confirm Password Field */}
                <div className="space-y-2 group">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-[#273155]">
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 transition-all duration-200 group-focus-within:text-[#273155] group-focus-within:scale-110" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 pr-12 h-14 border-2 border-gray-200 focus:border-[#273155] focus:ring-2 focus:ring-[#273155]/20 rounded-2xl text-base font-medium placeholder:text-gray-400 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-4 text-gray-400 hover:text-[#273155] transition-all duration-200 hover:scale-110 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-2xl p-4"
                  >
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-[#273155] to-[#1e2442] hover:from-[#1e2442] hover:to-[#273155] text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span className="animate-pulse">Redefinindo...</span>
                    </div>
                  ) : (
                    <span className="group-hover:tracking-wider transition-all duration-200">Redefinir Senha</span>
                  )}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-[#273155] hover:text-[#1e2442] font-semibold transition-all duration-200 hover:underline underline-offset-4"
                  >
                    Voltar ao Login
                  </button>
                </div>
              </motion.form>
            ) : (
              /* Success Animation */
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Sua senha foi redefinida com sucesso!<br/>
                    Você será redirecionado para o login em alguns segundos.
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#273155]"></div>
                </div>
              </motion.div>
            )}
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
