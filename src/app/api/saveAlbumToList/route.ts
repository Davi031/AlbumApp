import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromCookie(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { albumId, listId, name, imageUrl, artist } = await req.json()

    const album = await prisma.album.create({
      data: {
        name,
        imageUrl,
        artist,
        listId,
      }
    })

    return NextResponse.json(album, { status: 201 })
  } catch (error) {
    console.error('Erro ao salvar o álbum:', error)
    return NextResponse.json({ error: 'Erro ao salvar o álbum.' }, { status: 500 })
  }
}