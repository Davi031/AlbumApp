import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

export async function POST(req: Request) {
    const { email, password } = await req.json()

    if(!email || !password) {
        return NextResponse.json({ error: 'Dados incompletos'}, { status: 400})
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        return NextResponse.json({ error: 'Email já registrado' }, 
            { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword
        }
    })

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    )

    const response = NextResponse.json({
        message: 'Usuário criado com sucesso'
    })

    response.cookies.set('token', token, {
        httpOnly: true,
        path: '/', 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
    })

    return response
}