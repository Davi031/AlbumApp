'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(email, password)
      router.push('/') 
    } catch (err) {
      setError('Erro ao criar conta')
      console.error('Erro no registro:', err)
    }
  }

  return (
    
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        {error && <div className="mb-4 text-red-500">{error}</div>}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded text-gray-700"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded text-gray-700"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Registrar
        </button>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-blue-500 hover:underline"
          >
            Já tem uma conta? Faça login
          </button>
        </div>
      </form>
  )
}