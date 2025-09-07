'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Mail, Shield, Key, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export default function AdminRecoveryPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  
  const router = useRouter()
  const { theme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/generate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setNewPassword(data.newPassword)
      } else {
        setError(data.error || 'Erro ao gerar nova senha')
      }
    } catch (error) {
      setError('Erro interno do servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="w-full max-w-md">
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
              
              {/* Red accent layer for admin theme */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 rounded-3xl" />
              
              {/* Light reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-3xl" />
              
              {/* Subtle border */}
              <div className="absolute inset-0 rounded-3xl border border-white/10" />
            </>
          )}
          
          {/* Content wrapper */}
          <div className="relative z-10">
          <CardHeader className="space-y-4 pb-6 pt-10 px-8">
            {/* Logo */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-8">
                <Image
                  src={theme === 'dark' ? "/logo-branca.svg" : "/logo.svg"}
                  alt="TappyOne CRM"
                  width={300}
                  height={90}
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            {!success ? (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`} />
                  <CardTitle className={`text-2xl font-bold tracking-tight ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Admin Recovery
                  </CardTitle>
                </div>
                <CardDescription className={`text-base font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Geração automática de senha para administradores
                </CardDescription>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <CardTitle className={`text-2xl font-bold tracking-tight ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>
                  Nova Senha Gerada!
                </CardTitle>
                <CardDescription className={`text-base font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Senha enviada por email e exibida abaixo
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
                {/* Email Field */}
                <div className="space-y-2 group">
                  <Label htmlFor="email" className={`text-sm font-semibold transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-300 group-focus-within:text-blue-400'
                      : 'text-gray-700 group-focus-within:text-[#273155]'
                  }`}>
                    Email do Administrador
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
                      placeholder="admin@tappy.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-12 h-14 border-2 rounded-2xl text-base font-medium transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-slate-800/50 border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-white placeholder:text-gray-400 hover:border-slate-500 focus:bg-slate-800/70'
                          : 'border-gray-200 focus:border-[#273155] focus:ring-2 focus:ring-[#273155]/20 placeholder:text-gray-400 hover:border-gray-300 bg-gray-50/50 focus:bg-white'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Warning */}
                <div className={`border rounded-2xl p-4 ${
                  theme === 'dark'
                    ? 'bg-amber-900/20 border-amber-600/30'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <Shield className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                    }`} />
                    <div>
                      <p className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-amber-200' : 'text-amber-800'
                      }`}>
                        ⚠️ Acesso Restrito
                      </p>
                      <p className={`text-xs leading-relaxed ${
                        theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
                      }`}>
                        Esta funcionalidade é exclusiva para administradores. 
                        Uma nova senha será gerada automaticamente e enviada por email.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-2xl p-4 ${
                      theme === 'dark'
                        ? 'bg-red-900/20 border-red-600/30'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-14 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden ${
                    theme === 'dark' ? 'text-white' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                  }`}
                  style={theme === 'dark' ? {
                    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(239, 68, 68, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.6), 0 0 0 1px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  } : {}}
                >
                  {/* Glass effect layers for dark mode */}
                  {theme === 'dark' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-red-700/60 via-red-800/40 to-red-700/60 rounded-2xl" />
                      <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 via-transparent to-orange-500/20 rounded-2xl" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                      <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-red-400/50 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                    </>
                  )}
                  {isLoading ? (
                    <div className="flex items-center justify-center relative z-10">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span className="animate-pulse">Gerando Nova Senha...</span>
                    </div>
                  ) : (
                    <span className="group-hover:tracking-wider transition-all duration-200 flex items-center justify-center gap-2 relative z-10">
                      <Key className="h-5 w-5" />
                      Gerar Nova Senha
                    </span>
                  )}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className={`font-semibold transition-all duration-200 hover:underline underline-offset-4 flex items-center justify-center gap-2 mx-auto ${
                      theme === 'dark'
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-[#273155] hover:text-[#1e2442]'
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao Login
                  </button>
                </div>
              </motion.form>
            ) : (
              /* Success Display */
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-6"
              >
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <Key className={`w-10 h-10 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                
                {/* New Password Display */}
                <div className={`border-2 rounded-2xl p-6 ${
                  theme === 'dark'
                    ? 'bg-slate-800/30 border-slate-600'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <Label className={`text-sm font-semibold mb-2 block ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nova Senha Gerada:
                  </Label>
                  <div className={`border rounded-xl p-4 font-mono text-lg font-bold text-center tracking-wider ${
                    theme === 'dark'
                      ? 'bg-slate-900/50 border-slate-600 text-blue-400'
                      : 'bg-white border-gray-300 text-[#273155]'
                  }`}>
                    {newPassword}
                  </div>
                  <p className={`text-xs mt-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    💾 Salve esta senha em local seguro
                  </p>
                </div>

                <div>
                  <p className={`text-sm leading-relaxed mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    ✅ Nova senha gerada com sucesso!<br/>
                    📧 Enviada por email para: <strong>{email}</strong>
                  </p>
                </div>

                <Button
                  onClick={() => router.push('/login')}
                  className={`w-full h-12 text-white font-bold rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    theme === 'dark' ? 'text-white' : 'bg-gradient-to-r from-[#273155] to-[#1e2442] hover:from-[#1e2442] hover:to-[#273155]'
                  }`}
                  style={theme === 'dark' ? {
                    background: 'linear-gradient(135deg, rgba(39, 49, 85, 0.8) 0%, rgba(30, 36, 66, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    boxShadow: '0 20px 40px -12px rgba(39, 49, 85, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  } : {}}
                >
                  {theme === 'dark' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/60 via-slate-800/40 to-slate-700/60 rounded-2xl" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 rounded-2xl" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                    </>
                  )}
                  <span className="relative z-10">
                  Fazer Login com Nova Senha
                  </span>
                </Button>
              </motion.div>
            )}
          </CardContent>
          </div>
        </Card>

        {/* Footer */}
        <div className={`text-center mt-6 text-xs font-medium ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          © 2024 TappyOne CRM. Sistema Admin Recovery.
        </div>
      </div>
    </div>
  )
}
