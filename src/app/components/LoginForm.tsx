'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError('Credenciais inválidas')
      console.error('Erro no login:', err)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-sm"
    >
      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      <div className="mb-4">
        <label className="block text-gray-800 mb-2 text-sm sm:text-base" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-800 mb-2 text-sm sm:text-base" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        className="cursor-pointer w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Entrar
      </button>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => router.push('/register')}
          className="text-blue-600 hover:underline text-sm sm:text-base"
        >
          Criar nova conta
        </button>
      </div>
    </form>
  )
}
