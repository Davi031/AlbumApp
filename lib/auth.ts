import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export async function getUserFromCookie(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  console.log('[getUserFromCookie] Token:', token) // ADICIONE ISSO
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
    console.log('[getUserFromCookie] Decoded:', decoded) // E ISSO
    return decoded
  } catch (err) {
    console.error('[getUserFromCookie] Invalid token:', err) // E ISSO
    return null
  }
}