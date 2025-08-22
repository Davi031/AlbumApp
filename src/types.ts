export interface FixedAlbum {
  spotifyId?: any
  name: string
  id: string
  nameAlbum : string
  artist: string
  year: number
  imageUrl: string | null
  listId?: string
}

export type FixedList = {
  position: any
  id: string
  name: string
  description?: string
  albums: FixedAlbum[]
  userId: string
  parentId: string | null
  subLists: FixedList[] 
  children?: FixedList[]
  order: number
}