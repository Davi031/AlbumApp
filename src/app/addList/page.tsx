"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useListContext } from '../context/ListContext'
import { useAuth } from '../context/AuthContext'
import type { FixedAlbum, FixedList } from '../../types'
import { v4 as uuidv4 } from 'uuid'

export default function AddListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isSublistParam = searchParams.get('isSublist') === 'true'
  const parentListIdParam = searchParams.get('parentListId')
  const isEditMode = searchParams.get('isEdit') === 'true'
  const listIdParam = searchParams.get('listId')

  const { user, loading } = useAuth()
  const { lists, addAndSaveList, updateList, getListById } = useListContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [listName, setListName] = useState('')
  const [listDescription, setListDescription] = useState('')
  const [searchResults, setSearchResults] = useState<FixedAlbum[]>([])
  const [selectedAlbums, setSelectedAlbums] = useState<FixedAlbum[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [originalData, setOriginalData] = useState<FixedList | null>(null)

  // Carrega dados do usuário
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // Carrega lista para edição
  useEffect(() => {
    if (isEditMode && listIdParam) {
      (async () => {
        const listData = await getListById(listIdParam)
        if (listData) {
          setListName(listData.name)
          setListDescription(listData.description || '')
          setSelectedAlbums(listData.albums || [])
          setOriginalData(listData)
        }
      })()
    }
  }, [isEditMode, listIdParam, getListById])

  // Busca de álbuns
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchTerm.length > 2) {
        setIsLoading(true)
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`)
          const data = await res.json()
          setSearchResults(
            data.map((album: any) => {
              const existing = selectedAlbums.find(
                a => a.spotifyId === album.id ||
                  (a.name === album.name && a.artist === (album.artists?.[0]?.name || ''))
              );

              return {
                id: existing ? existing.id : uuidv4(),
                name: album.name,
                nameAlbum: album.name,
                artist: album.artists?.[0]?.name || '',
                year: Number(album.release_date?.slice(0, 4)) || 0,
                imageUrl: album.images?.[0]?.url || null,
                spotifyId: album.id || null
              };
            })
          )
        } catch (err) {
          console.error('Erro ao buscar álbuns:', err)
          setSearchResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSearchResults([])
      }
    }, 400)

    return () => clearTimeout(delay)
  }, [searchTerm, selectedAlbums])

  const handleSelectAlbum = (album: FixedAlbum) => {
    if (!selectedAlbums.some(a => a.name === album.name && a.artist === album.artist)) {
      setSelectedAlbums(prev => [...prev, album])
      setSearchTerm('')
      setSearchResults([])
    }
  }

  const handleRemoveAlbum = (id: string) => {
    setSelectedAlbums(prev => prev.filter(a => a.id !== id))
  }

  // Submissão da lista
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSaving) return

    if (!isSublistParam && !isEditMode && !listName.trim()) {
      alert('O nome da lista é obrigatório')
      return
    }

    setIsSaving(true)

    try {
      const preparedAlbums = selectedAlbums.map(album => ({
        id: album.id,
        name: album.nameAlbum || album.name,
        nameAlbum: album.nameAlbum || album.name,
        artist: album.artist,
        year: album.year,
        imageUrl: album.imageUrl || null,
        spotifyId: album.spotifyId ?? null
      }))

      let savedList: FixedList

      if (isEditMode && originalData) {
        const updatedList = {
          ...originalData,
          name: listName.trim() || originalData.name,
          description: listDescription.trim() || originalData.description || '',
          albums: preparedAlbums
        }
        savedList = await updateList(updatedList)
      } else {
        const newListData: Omit<FixedList, 'createdAt' | 'updatedAt'> = {
          id: uuidv4(),
          name: listName.trim(),
          description: listDescription.trim() || '',
          albums: preparedAlbums,
          userId: user!.id,
          parentId: isSublistParam ? parentListIdParam || null : null,
          subLists: [],
          position: lists.filter(l => l.parentId === (isSublistParam ? parentListIdParam : null)
          ).length,
          order: 0
        }

        savedList = await addAndSaveList(newListData)
      }
      router.replace(`/lists/${savedList.id}`)
    } catch (err) {
      console.error('Erro ao salvar lista:', err)
      alert('Ocorreu um erro ao salvar a lista.')
      setIsSaving(false)
    }
  }

  // Tela de carregamento durante salvar/editar
  if (loading || isSaving || (isEditMode && !originalData)) {
    return (
      <div className="p-8 dark:bg-gray-800 min-h-screen flex flex-col items-center justify-center dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg">
          {isSaving ? 'Salvando lista...' : isEditMode ? 'Carregando lista...' : 'Carregando...'}
        </p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="dark:bg-gray-900 min-h-screen min-w-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          {isEditMode ? 'Editar Lista' : isSublistParam ? 'Nova Sub-lista' : 'Nova Lista'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {/* Nome da lista */}
          <div>
            <label htmlFor="listName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome da Lista
            </label>
            <input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex: Melhores Álbuns de Rock dos Anos 90"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="listDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              id="listDescription"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              placeholder="Descreva sua lista..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white h-24"
            />
          </div>

          {/* Busca de álbuns */}
          <div>
            <label htmlFor="albumSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adicionar Álbuns
            </label>
            <div className="relative">
              <input
                id="albumSearch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busque por álbuns (mínimo 3 caracteres)..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {isLoading && (
                <div className="absolute right-3 top-3.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>

          {/* Resultados da busca */}
          {searchResults.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <ul className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                {searchResults.map((album) => (
                  <li
                    key={album.id}
                    className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors flex items-center"
                    onClick={() => handleSelectAlbum(album)}
                  >
                    {album.imageUrl && (
                      <img
                        src={album.imageUrl}
                        alt={`Capa do álbum ${album.name}`}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{album.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{album.artist} • {album.year}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Álbuns selecionados */}
          {selectedAlbums.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Álbuns Selecionados ({selectedAlbums.length})
              </h2>
              <div className="space-y-2">
                {selectedAlbums.map((album) => (
                  <div
                    key={album.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center">
                      {album.imageUrl && (
                        <img
                          src={album.imageUrl}
                          alt={`Capa do álbum ${album.name}`}
                          className="w-10 h-10 object-cover rounded mr-3"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{album.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{album.artist} • {album.year}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAlbum(album.id)}
                      className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors cursor-pointer"
                      aria-label="Remover álbum"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving || (!isEditMode && !listName.trim() && !isSublistParam)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg cursor-pointer font-medium transition-colors ${isSaving || (!isEditMode && !listName.trim() && !isSublistParam)
                ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white'
                }`}
            >
              {isSaving ? 'Salvando...' : isEditMode ? 'Atualizar Lista' : 'Criar Lista'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}