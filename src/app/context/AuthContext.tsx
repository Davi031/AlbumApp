'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetcher } from '@/lib/fetcher'
import { API_URL } from '@/lib/api'

interface AuthContextType {
  user: any
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
  const initializeAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        credentials: 'include' 
      })

      if (!res.ok) {
        setUser(null)
      } else {
        const data = await res.json()
        setUser(data.user) 
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  initializeAuth()
}, [])

  const login = async (email: string, password: string) => {
    const data = await fetcher(`${API_URL}/api/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const logout = async () => {
    try {
      await fetcher(`${API_URL}/api/logout`, { method: 'POST' })
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      router.push('/')
    }
  }

  const register = async (email: string, password: string) => {
    const data = await fetcher(`${API_URL}/api/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}