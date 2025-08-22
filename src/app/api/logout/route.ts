import { NextResponse } from 'next/server' 

export async function POST() {
    const res = NextResponse.json({ message: 'Logout realizado '})

    res.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
        sameSite: 'lax'
    })

    return res 
}