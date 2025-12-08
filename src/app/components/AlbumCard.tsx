'use client'

import { useState } from "react"
import { useListContext } from "../context/ListContext"

interface Album {
  name: string
  id: string
  nameAlbum: string
  artist: string
  year?: number
  imageUrl: string | null
  listId?: string
}

export default function AlbumCard({ album }: { album: Album }) {
  const { lists = [], copyAlbumToList, moveAlbumToList } = useListContext()

  const [selectedAction, setSelectedAction] = useState<"copy" | "move" | null>(null)
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [showListMenu, setShowListMenu] = useState(false)

  const [expandedListIds, setExpandedListIds] = useState<string[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loadingTargetId, setLoadingTargetId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedListIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]))
  }

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, message: msg })
    setTimeout(() => setToast(null), 2500)
  }

  const handleCopy = async (listId: string) => {
    try {
      setLoadingTargetId(listId)
      await copyAlbumToList(album, listId)
      showToast('success', 'Álbum copiado!')
    } catch (err: any) {
      console.error(err)
      showToast('error', err?.message || 'Erro ao copiar álbum')
    } finally {
      setLoadingTargetId(null)
      setShowMainMenu(false)
      setShowListMenu(false)
    }
  }

  const handleMove = async (listId: string) => {
    try {
      setLoadingTargetId(listId)
      await moveAlbumToList(album, '', listId)
      showToast('success', 'Álbum movido!')
    } catch (err: any) {
      console.error(err)
      showToast('error', err?.message || 'Erro ao mover álbum')
    } finally {
      setLoadingTargetId(null)
      setShowMainMenu(false)
      setShowListMenu(false)
    }
  }

  const renderLists = (items: any[], level = 0) => {
    return items.map((list) => {
      const hasSubs = list.subLists && list.subLists.length > 0
      const expanded = expandedListIds.includes(list.id)

      const handleListClick = () => {
        if (hasSubs) {
          toggleExpand(list.id)
        } else {
          selectedAction === "copy"
            ? handleCopy(list.id)
            : handleMove(list.id)
        }
      }

      return (
        <div key={list.id} className="mb-1">
          <div
            className={`flex items-center justify-between cursor-pointer py-1 px-2 
                      hover:bg-gray-100 rounded-md ml-${level * 2}`}
            onClick={handleListClick}
          >
            <p className="text-gray-700 text-xs">{list.name}</p>

            {/* Seta continua aparecendo, mas agora é só decorativa (não clica) */}
            {hasSubs && (
              <span className="text-gray-600 text-xs select-none">
                {expanded ? "▼" : "▶"}
              </span>
            )}
          </div>

          {/* Sublistas visíveis apenas se expandido */}
          {hasSubs && expanded && (
            <div className="ml-4">
              {renderLists(list.subLists, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow relative">
      {/* Toast */}
      {toast && (
        <div
          className={`absolute top-2 right-2 text-xs px-3 py-1 rounded shadow ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
        >
          {toast.message}
        </div>
      )}

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

      <div className="flex items-center space-x-3">
        <div>
          <h3 className="font-large text-white font-bold">{album.name}</h3>
          <p className="text-sm text-white">{album.artist}</p>
          {album.year && <p className="text-xs text-white mt-1">{album.year}</p>}
        </div>

        <div className="h-8 w-px bg-white"></div>

        <div
          className="relative inline-block"
          onMouseLeave={() => {
            setShowMainMenu(false)
            setShowListMenu(false)
          }}
        >
          <p
            className="text-xs text-white select-none mr-2 cursor-pointer"
            onMouseEnter={() => setShowMainMenu(true)}
          >
            Redirecionar
          </p>

          {/* MENU PRINCIPAL */}
          {showMainMenu && (
            <div
              className="absolute top-1/2 left-full -translate-y-1/2 translate-x-2 
               bg-white rounded-xl shadow-xl z-30 w-36 p-2
               before:content-[''] before:absolute before:left-[-20px] before:top-0
               before:w-5 before:h-full before:bg-transparent"
              onMouseEnter={() => setShowMainMenu(true)}
            >
              <p
                className="text-gray-700 text-xs py-1 px-2 hover:bg-gray-100 rounded-md cursor-pointer"
                onMouseEnter={() => {
                  setSelectedAction("copy")
                  setShowListMenu(true)
                }}
              >
                Copiar para
              </p>

              <div className="h-px bg-gray-300 my-1"></div>

              <p
                className="text-gray-700 text-xs py-1 px-2 hover:bg-gray-100 rounded-md cursor-pointer"
                onMouseEnter={() => {
                  setSelectedAction("move")
                  setShowListMenu(true)
                }}
              >
                Enviar para
              </p>
            </div>
          )}

          {/* MENU DE LISTAS */}
          {showListMenu && (
            <div className="absolute top-1/2 left-full -translate-y-1/2 translate-x-40 bg-white rounded-xl shadow-xl z-40 w-40 p-2 
            before:content-[''] before:absolute before:left-[-20px] before:top-0
               before:w-5 before:h-full before:bg-transparent">
              {renderLists(lists)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}