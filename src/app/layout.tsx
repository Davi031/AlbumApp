import './globals.css'
import { Provider } from './provider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Album App',
  description: 'Gerenciador de listas de álbuns com sublistas dinâmicas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="bg-white dark:bg-gray-800 min-h-full transition-colors duration-300">
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}