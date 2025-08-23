import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromCookie } from '@/lib/auth'

// Função recursiva para obter sublistas completas
async function getSubListsRecursive(listId: string) {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: {
      albums: true,
      subLists: {
        include: {
          albums: true,
          subLists: {
            include: { albums: true }
          }
        }
      }
    }
  })

  if (!list) return null

  list.subLists = (
    await Promise.all(list.subLists.map(sub => getSubListsRecursive(sub.id)))
  ).filter((sub): sub is NonNullable<typeof sub> => sub !== null)

  return list
}

// Função recursiva para atualizar lista/sublistas
async function updateListRecursive(listData: any, userId: string) {
  const existingList = await prisma.list.findUnique({
    where: { id: listData.id },
    include: { albums: true, subLists: true }
  })

  if (!existingList || existingList.userId !== userId) return null

  await prisma.album.deleteMany({
    where: {
      listId: listData.id,
      id: { notIn: (listData.albums || []).map((a: any) => a.id) }
    }
  })

  const updatedList = await prisma.list.update({
    where: { id: listData.id },
    data: {
      name: listData.name,
      description: listData.description,
      position: listData.position ?? existingList.position,
      albums: {
        upsert: (listData.albums || []).map((a: any) => ({
          where: { id: a.id ?? '' },
          update: {
            name: a.name,
            artist: a.artist,
            year: a.year,
            imageUrl: a.imageUrl
          },
          create: {
            name: a.name,
            artist: a.artist,
            year: a.year,
            imageUrl: a.imageUrl
          }
        }))
      }
    },
    include: { albums: true, subLists: true }
  })

  if (listData.subLists?.length > 0) {
    for (const sub of listData.subLists) {
      await updateListRecursive(sub, userId)
    }
  }

  return await getSubListsRecursive(updatedList.id)
}

// Função recursiva para deletar lista/sublistas
async function deleteListRecursive(listId: string) {
  const subLists = await prisma.list.findMany({
    where: { parentId: listId },
    select: { id: true }
  })

  for (const sub of subLists) {
    await deleteListRecursive(sub.id)
  }

  await prisma.list.delete({ where: { id: listId } })
}

// GET
export async function GET(req: NextRequest, context: any) {
  try {
    const { id } = context.params
    const user = await getUserFromCookie(req)
    if (!user || user.id !== id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const rootLists = await prisma.list.findMany({
      where: { userId: user.id, parentId: null },
      include: { albums: true, subLists: { include: { albums: true } } },
      orderBy: { position: 'asc' }
    })

    const listsWithDepth = (
      await Promise.all(rootLists.map(list => getSubListsRecursive(list.id)))
    ).filter((list): list is NonNullable<typeof list> => list !== null)

    return NextResponse.json(listsWithDepth)
  } catch (error) {
    console.error('Error fetching lists:', error)
    return NextResponse.json({ error: "Failed to fetch lists" }, { status: 500 })
  }
}

// POST
export async function POST(req: NextRequest, context: any) {
  try {
    const { id } = context.params
    const user = await getUserFromCookie(req)
    if (!user || user.id !== id) return unauthorizedResponse()

    const { list } = await req.json()

    const createdList = await prisma.list.create({
      data: {
        id: list.id || undefined,
        name: list.name,
        description: list.description,
        userId: user.id,
        parentId: list.parentId || null,
        position: list.position ?? 0,
        albums: {
          create: list.albums?.map((album: any) => ({
            name: album.name,
            artist: album.artist,
            year: album.year,
            imageUrl: album.imageUrl
          })) || []
        }
      },
      include: { albums: true, subLists: true }
    })

    return NextResponse.json(createdList, { status: 201 })
  } catch (error) {
    console.error('Error creating list:', error)
    return errorResponse(error)
  }
}

// PUT
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromCookie(req)
    if (!user) return unauthorizedResponse()

    const data = await req.json()

    if (Array.isArray(data.orderedLists)) {
      const updatePromises = data.orderedLists.map((l: any) =>
        prisma.list.update({
          where: { id: l.id },
          data: { position: l.position }
        })
      )

      await Promise.all(updatePromises)

      const rootLists = await prisma.list.findMany({
        where: { userId: user.id, parentId: null },
        orderBy: { position: 'asc' }
      })

      const listsWithDepth = (
        await Promise.all(rootLists.map(list => getSubListsRecursive(list.id)))
      ).filter((list): list is NonNullable<typeof list> => list !== null)

      return NextResponse.json(listsWithDepth, { status: 200 })
    }

    if (!data.id)
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

    const updatedList = await updateListRecursive(data, user.id)
    if (!updatedList)
      return NextResponse.json({ error: 'Lista não encontrada ou não autorizada' }, { status: 404 })

    return NextResponse.json(updatedList, { status: 200 })
  } catch (error) {
    console.error('Error updating list:', error)
    return errorResponse(error)
  }
}

// DELETE
export async function DELETE(req: NextRequest, context: any) {
  try {
    const user = await getUserFromCookie(req)
    if (!user) return unauthorizedResponse()

    const url = new URL(req.url)
    const listId = url.searchParams.get('listId')
    if (!listId)
      return NextResponse.json({ error: 'listId obrigatório' }, { status: 400 })

    const list = await prisma.list.findUnique({ where: { id: listId } })
    if (!list)
      return NextResponse.json({ error: 'Lista não encontrada' }, { status: 404 })

    if (list.userId !== user.id) return unauthorizedResponse()

    await deleteListRecursive(listId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao deletar lista:', error)
    return errorResponse(error)
  }
}

// Helpers
const unauthorizedResponse = () =>
  NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

const errorResponse = (error: any) =>
  NextResponse.json({ error: error.message || 'Erro no servidor' }, { status: 500 })