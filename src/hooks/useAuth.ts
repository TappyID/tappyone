import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  nome: string
  email: string
  tipo: string
  ativo: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    isAuthenticated: false
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    console.log('🔐 [useAuth] checkAuth chamado')
    let token: string | null = null
    
    try {
      token = localStorage.getItem('token')
    } catch (error) {
      console.error('❌ Erro ao acessar localStorage:', error)
      // Se não conseguir acessar o localStorage, limpar e continuar
      try {
        localStorage.clear()
      } catch (clearError) {
        console.error('❌ Erro ao limpar localStorage:', clearError)
      }
    }
    
    if (!token) {
      setAuthState({
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false
      })
      return
    }

    try {
      console.log('🔐 [useAuth] Verificando token com /api/auth/me...')
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🔐 [useAuth] Response status:', response.status)
      
      if (response.ok) {
        const userData = await response.json()
        console.log('✅ [useAuth] Token válido, usuário:', userData.nome)
        setAuthState({
          user: userData,
          token,
          loading: false,
          isAuthenticated: true
        })
      } else {
        // Token inválido
        console.warn('⚠️ [useAuth] Token inválido (status:', response.status, ') - removendo token')
        try {
          localStorage.removeItem('token')
        } catch (removeError) {
          console.error('❌ Erro ao remover token inválido:', removeError)
        }
        setAuthState({
          user: null,
          token: null,
          loading: false,
          isAuthenticated: false
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error)
      try {
        localStorage.removeItem('token')
      } catch (removeError) {
        console.error('❌ Erro ao remover token após falha na verificação:', removeError)
      }
      setAuthState({
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false
      })
    }
  }

  const login = (token: string, user: User) => {
    try {
      // Limpar localStorage antes de tentar salvar o novo token
      localStorage.removeItem('token')
      
      // Verificar se há espaço suficiente no localStorage
      const testKey = 'test_storage_quota'
      try {
        localStorage.setItem(testKey, token)
        localStorage.removeItem(testKey)
      } catch (quotaError) {
        console.error('❌ Erro de quota no localStorage:', quotaError)
        
        // Tentar limpar outros dados para liberar espaço
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key !== 'token') {
            keysToRemove.push(key)
          }
        }
        
        // Remover chaves não essenciais
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key)
            console.log(`🗑️ Removido do localStorage: ${key}`)
          } catch (e) {
            console.warn(`⚠️ Não foi possível remover ${key}:`, e)
          }
        })
        
        // Tentar novamente após limpeza
        try {
          localStorage.setItem(testKey, token)
          localStorage.removeItem(testKey)
        } catch (finalError) {
          console.error('❌ Ainda não há espaço suficiente após limpeza:', finalError)
          throw new Error('Não há espaço suficiente no localStorage para o token')
        }
      }
      
      // Salvar o token no localStorage
      localStorage.setItem('token', token)
      
      // Salvar o token nos cookies para o middleware
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
      
      console.log('✅ Token salvo com sucesso no localStorage e cookies')
      
      setAuthState({
        user,
        token,
        loading: false,
        isAuthenticated: true
      })
    } catch (error) {
      console.error('❌ Erro ao salvar token:', error)
      
      // Mesmo com erro no localStorage, manter o estado na memória
      setAuthState({
        user,
        token,
        loading: false,
        isAuthenticated: true
      })
      
      // Notificar o usuário sobre o problema
      alert('Aviso: Não foi possível salvar o token no navegador. Você precisará fazer login novamente ao recarregar a página.')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    
    // Limpar credenciais salvas do "Lembrar-me"
    localStorage.removeItem('rememberedEmail')
    localStorage.removeItem('rememberedPassword')
    localStorage.removeItem('rememberMe')
    
    // Limpar cookie do token
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; samesite=strict'
    
    console.log('🔒 Logout realizado - todas as credenciais removidas')
    
    setAuthState({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false
    })
    router.push('/login')
  }

  const getDashboardRoute = (userType: string) => {
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
        return '/dashboard'
    }
  }

  return {
    ...authState,
    login,
    logout,
    checkAuth,
    getDashboardRoute
  }
}
