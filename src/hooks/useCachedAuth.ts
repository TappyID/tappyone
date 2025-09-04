'use client'

import { useState, useEffect, useCallback } from 'react'
import { globalCache, cacheKeys, fetchWithCache } from '@/utils/globalCache'

export interface User {
  id: string
  nome: string
  email: string
  tipo: string
  ativo: boolean
  avatar_url?: string
}

export function useCachedAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar token no localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
    }
    setLoading(false)
  }, [])

  // Buscar dados do usuário com cache
  const fetchUserData = useCallback(async (authToken: string) => {
    if (!authToken) return null

    try {
      const cacheKey = cacheKeys.authMe(authToken)
      
      const userData = await fetchWithCache<User>(
        cacheKey,
        '/api/auth/me',
        {
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        },
        2 * 60 * 1000 // Cache de 2 minutos para auth
      )

      setUser(userData)
      setIsAuthenticated(true)
      return userData
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      setUser(null)
      setIsAuthenticated(false)
      
      // Se erro de auth, limpar token
      if (error instanceof Error && error.message.includes('401')) {
        localStorage.removeItem('token')
        setToken(null)
      }
      
      return null
    }
  }, [])

  // Efeito para buscar dados quando token mudar
  useEffect(() => {
    if (token && !loading) {
      fetchUserData(token)
    } else if (!token) {
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [token, loading, fetchUserData])

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        throw new Error('Credenciais inválidas')
      }

      const { token: newToken, user: userData } = await response.json()
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)

      // Pré-carregar no cache
      const cacheKey = cacheKeys.authMe(newToken)
      globalCache.preload(cacheKey, userData)

      return userData
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }, [])

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    
    // Limpar cache relacionado ao auth
    if (token) {
      const cacheKey = cacheKeys.authMe(token)
      globalCache.invalidate(cacheKey)
    }
  }, [token])

  // Refresh manual
  const refresh = useCallback(() => {
    if (token) {
      // Invalidar cache e buscar novamente
      const cacheKey = cacheKeys.authMe(token)
      globalCache.invalidate(cacheKey)
      fetchUserData(token)
    }
  }, [token, fetchUserData])

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    refresh
  }
}
