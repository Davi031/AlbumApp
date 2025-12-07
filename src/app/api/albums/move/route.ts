import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromCookie(req)
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { albumId, currentListId, targetListId } = await req.json()

        if (!albumId || !currentListId || !targetListId) {
            return NextResponse.json({ error: 'Parâmetros obrigatórios' })
        }

        const album = await prisma.album.findUnique({ where: { id: albumId } })
        if (!album) return NextResponse.json({ error: 'Álbum não encontrado' }, { status: 404 })

        //Checar se pertence à currentListId
        if (album.listId !== currentListId) {
            return NextResponse.json({ error: 'Álbum não pertence à lista atual' }, { status: 400 })
        }

        //Checar permissões 
        const currentList = await prisma.list.findUnique({ where: { id: currentListId }})
        const targetList = await prisma.list.findUnique({ where: { id: targetListId }})

        if (!currentList || currentList.userId !== user.id) return NextResponse.json({ error: 'Lista atual não encontrada'}, { status: 403})
        if (!targetList || targetList.userId !== user.id) return NextResponse.json({ error: 'Lista destino não autorizada'}, { status: 403 })

        //Atualizar listId do álbum
        const updated = await prisma.album.update({ 
            where: { id: albumId },
            data: { listId: targetListId }
        })

        return NextResponse.json(updated, { status: 200 })
    } catch(error: any) {
        console.error('Erro na rota', error)
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
    }
}