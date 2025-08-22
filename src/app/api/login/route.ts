import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
    const { email, password } = await req.json()

    if (!email || !password) {
        return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.password) {
        return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
        return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 })
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: '7d'
        }
    )

    const response = NextResponse.json({
        message: 'Login realizado com sucesso',
        user: {
            id: user.id,
            email: user.email,
        },
        token,
    })

    response.cookies.set('token', token, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    })

    return response
}

