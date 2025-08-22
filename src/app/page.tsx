'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useListContext } from './context/ListContext'
import { useAuth } from './context/AuthContext'
import { NestedList } from './components/NestedList'
import { ListSkeleton } from './components/ListSkeleton'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'


export default function HomePage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const { lists, fetchLists, updateRootListsOrder } = useListContext()
  const [openLists, setOpenLists] = useState<Record<string, boolean>>({})
  const [rootLists, setRootLists] = useState<any[]>([])
  const [loadingLists, setLoadingLists] = useState(true) // 👈 novo estado

  useEffect(() => {
    if (!loading && user) {
      setLoadingLists(true)
      fetchLists().finally(() => setLoadingLists(false)) // 👈 marca quando terminou
    }
  }, [loading, user, fetchLists])

  useEffect(() => {
    setRootLists(lists.filter(list => list.parentId === null))
  }, [lists])

  const toggleSublist = (listId: string) => {
    setOpenLists(prev => ({
      ...prev,
      [listId]: !prev[listId],
    }))
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const newOrder = Array.from(rootLists)
    const [moved] = newOrder.splice(result.source.index, 1)
    newOrder.splice(result.destination.index, 0, moved)

    const updatedWithPosition = newOrder.map((l, index) => ({ ...l, position: index }))
    setRootLists(updatedWithPosition)

    updateRootListsOrder(updatedWithPosition).catch(console.error)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-lg">Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-white">
          Bem-vindo ao Album App 🎵
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm items-center justify-center">
          <button
            onClick={() => router.push('/login')}
            className="w-full sm:w-auto px-6 py-3 bg-white text-gray-800 rounded hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/register')}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Cadastrar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gray-800 min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Todas as Listas de álbuns</h1>
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{user.email}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/addList"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              + Nova Lista
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {loadingLists ? ( 
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <ListSkeleton key={i} />
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="rootLists">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {rootLists.map((list, index) => (
                    <Draggable key={list.id} draggableId={list.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border border-gray-300 rounded-lg overflow-hidden bg-white transition-transform ${
                            snapshot.isDragging ? 'shadow-lg scale-105 z-10' : ''
                          }`}
                        >
                          <div className="p-4 flex flex-row justify-between items-center gap-2 flex-wrap sm:flex-nowrap">
                            <h2
                              className="text-black text-xl font-semibold cursor-pointer flex-1 min-w-0 hover:text-blue-600 truncate"
                              onClick={() => router.push(`/lists/${list.id}`)}
                            >
                              {list.name}
                            </h2>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                title="Arrastar lista"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              </div>

                              {list.subLists?.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleSublist(list.id)
                                  }}
                                  className="text-gray-500 hover:text-gray-700"
                                  aria-label="Mostrar sublistas"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-5 w-5 transition-transform ${openLists[list.id] ? 'rotate-180' : ''}`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              )}
                              <Link
                                href={`/addList?isSublist=true&parentListId=${list.id}`}
                                className="text-blue-500 hover:text-blue-700"
                                title="Adicionar sublista"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                              </Link>
                            </div>
                          </div>

                          {list.description && (
                            <p className="px-4 pb-2 text-gray-500">{list.description}</p>
                          )}

                          {list.subLists?.length > 0 && openLists[list.id] && (
                            <div className="border-t border-gray-200 bg-gray-50 text-gray-400">
                              {list.subLists.map((sublist: any) => (
                                <NestedList key={sublist.id} list={sublist} depth={1} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </main>
  )
}