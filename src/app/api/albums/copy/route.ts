import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromCookie(req) 
        if(!user) return NextResponse.json({ error: 'Não autorizado'}, { status: 401 })

        const { albumId, targetListId } = await req.json()

        if (!albumId || !targetListId) {
            return NextResponse.json({ error: 'ParâMmetros obrigatórios: albumId e targetListId' },{status: 400})
        }

        const targetList = await prisma.list.findUnique({ where: { id: targetListId } })
        if (!targetList || targetList.userId !== user.id) {
            return NextResponse.json({ error: 'Lista destino não encontrada ou não autorizada'}, { status: 404 })
        }

        const album = await prisma.album.findUnique({ where: { id: albumId }})
        if (!album) return NextResponse.json({ error: 'Álbum não encontrado' }, { status: 404 })

        const created = await prisma.album.create({
            data: {
                name: album.name,
                artist: album.artist,
                year: album.year ?? null, 
                imageUrl: album.imageUrl ?? null,
                listId: targetListId
            }
        })

        return NextResponse.json(created, { status: 201 })
    } catch (error: any) {
        console.error('Erro na rota', error)
    return NextResponse.json({ error: error.message || 'Erro interno'}, { status: 500 })
 }
}