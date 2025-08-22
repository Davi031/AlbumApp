'use client'

import { useParams, useRouter } from 'next/navigation'
import { useListContext } from '../../context/ListContext'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import AlbumCard from '../../components/AlbumCard'
import { useMemo } from 'react'

export default function ListPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { lists, getListById, deleteList } = useListContext()

  const [isSublistOpen, setIsSublistOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const currentList = useMemo(() => getListById(id as string), [id, lists, getListById])

  useEffect(() => {
    if (currentList !== undefined) {
      setIsLoading(false)
    }
  }, [currentList])

  const handleDelete = async () => {
    if (!currentList) return

    setIsDeleting(true)
    try {
      await deleteList(currentList.id)
      router.push('/')
    } catch (error) {
      console.error('Erro ao deletar lista:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 dark:bg-gray-800 min-h-screen flex flex-col items-center justify-center dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg">Carregando lista...</p>
      </div>
    )
  }

  if (!currentList) {
    return (
      <div className="p-8 dark:bg-gray-800 min-h-screen flex flex-col items-center justify-center dark:text-white">
        <p className="text-lg">Lista não encontrada.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">{currentList.name}</h1>
            {currentList.description && (
              <p className="text-gray-600 dark:text-gray-300 mt-2">{currentList.description}</p>
            )}
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <button
              onClick={() => router.push(`/`)}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-400 cursor-pointer"
            >
              Tela Inicial
            </button>
            <button
              onClick={() => router.push(`/addList?isEdit=true&listId=${currentList.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              Editar Lista
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
            >
              Deletar Lista
            </button>
          </div>
        </div>

        {/* Seção de Álbuns */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Álbuns</h2>
          {currentList.albums?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentList.albums.map(album => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Nenhum álbum adicionado ainda</p>
          )}
        </section>

        {/* Seção de Sublistas */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setIsSublistOpen(!isSublistOpen)}
              className="flex items-center text-xl font-semibold hover:text-blue-600 dark:hover:text-blue-400 dark:text-white cursor-pointer"
            >
              Sublistas
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ml-2 transition-transform ${isSublistOpen ? 'rotate-180' : ''} dark:text-white`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => router.push(`/addList?isSublist=true&parentListId=${currentList.id}`)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
            >
              + Nova Sublista
            </button>
          </div>

          {isSublistOpen && (
            <div className="space-y-3 mt-3">
              {currentList.subLists && currentList.subLists.length > 0 ? (
                currentList.subLists.map(sublist => (
                  <div
                    key={sublist.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center dark:border-gray-600"
                    onClick={() => router.push(`/lists/${sublist.id}`)}
                  >
                    <span className="font-medium dark:text-white">
                      {sublist.name.split('.').pop()}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Nenhuma sublista criada ainda</p>
              )}
            </div>
          )}
        </div>

        {showDeleteModal && currentList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full border dark:border-gray-700">
              <h3 className="text-lg font-bold mb-4 dark:text-white">Confirmar Deleção</h3>
              <p className="mb-6 dark:text-gray-300">Tem certeza que deseja deletar a lista "{currentList.name}"? Esta ação não pode ser desfeita.</p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:hover:bg-red-800 flex items-center cursor-pointer"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deletando...
                    </>
                  ) : 'Deletar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}