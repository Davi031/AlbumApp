import { NextRequest, NextResponse } from "next/server"
import { searchAlbumsSpotify } from "@/lib/spotify"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q") || ""
  const limit = parseInt(searchParams.get("limit") || "20")

  if (!query) {
    return NextResponse.json({ error: "O parâmetro 'q' é obrigatório." }, { status: 400 })
  }

  try {
    const albums = await searchAlbumsSpotify(query, limit)
    return NextResponse.json(albums)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar álbuns." }, { status: 500 })
  }
}