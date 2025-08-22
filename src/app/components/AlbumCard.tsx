'use client'

interface Album {
  id: string
  nameAlbum: string
  artist: string
  year?: number
  imageUrl: string | null 
}

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      {album.imageUrl && (
        <img 
          src={album.imageUrl} 
          alt={album.nameAlbum}
          className="w-full h-48 object-cover rounded mb-3"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      )}
      <h3 className="font-medium text-white">{album.nameAlbum}</h3>
      <p className="text-sm text-white">{album.artist}</p>
      {album.year && <p className="text-xs text-white mt-1">{album.year}</p>}
    </div>
  )
}