import { NextRequest, NextResponse } from 'next/server' 
import { prisma } from '@/lib/prisma'
import { getUserFromCookie } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromCookie(req) 
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = req.nextUrl
        const listId = searchParams.get('listId')

        if (!listId) return NextResponse.json({ error: 'listId obrigatório' }, { status: 400 })

        const albums = await prisma.album.findMany({
            where: { listId }
        })

        return NextResponse.json(albums)
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar álbuns.' }, { status: 500 })
    }
}