'use client'

import { Suspense } from 'react'
import AddListClient from './AddListClient'

export default function AddListPage() {
  return (
    <Suspense fallback={<div className="p-8 min-h-screen flex items-center justify-center">Carregando...</div>}>
      <AddListClient />
    </Suspense>
  )
}