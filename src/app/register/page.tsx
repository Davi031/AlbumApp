'use client'

import RegisterForm from '../components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-800 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center text-black">Cadastro</h1>
        <RegisterForm />
      </div>
    </div>
  )
}