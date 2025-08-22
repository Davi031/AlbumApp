'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { FixedList as List } from '../../types'
import { useAuth } from './AuthContext'
import { API_URL } from '@/lib/api'

interface ListContextType {
  lists: List[]
  fetchLists: () => Promise<void>
  addAndSaveList: (newList: List) => Promise<List>
  updateList: (updatedList: List) => Promise<List>
  deleteList: (listId: string) => Promise<boolean>
  getListById: (id: string) => List | null
  removeAlbumFromList: (listId: string, albumId: string) => Promise<List>
  updateRootListsOrder: (newOrder: List[]) => Promise<void>
}

const ListContext = createContext<ListContextType | undefined>(undefined)

export const useListContext = () => {
  const context = useContext(ListContext)
  if (!context) throw new Error('useListContext must be used within a ListProvider')
  return context
}

export const ListProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [lists, setLists] = useState<List[]>([])

  const fetchLists = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`${API_URL}/api/lists/user/${user.id}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Falha ao buscar listas')
      const data: List[] = await res.json()
      setLists(data)
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [user])

  const getListById = useCallback(
    (id: string): List | null => {
      const find = (lists: List[]): List | null => {
        for (const l of lists) {
          if (l.id === id) return l
          const found = l.subLists ? find(l.subLists) : null
          if (found) return found
        }
        return null
      }
      return find(lists)
    },
    [lists]
  )

  const updateListRecursive = (lists: List[], updated: List): List[] =>
    lists.map(l => {
      if (l.id === updated.id) return updated
      if (l.subLists?.length) return { ...l, subLists: updateListRecursive(l.subLists, updated) }
      return l
    })

  const updateList = useCallback(
    async (updatedList: List) => {
      setLists(prev => updateListRecursive([...prev], updatedList))
      try {
        const res = await fetch(`${API_URL}/api/lists/user/${user?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedList),
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Falha ao atualizar lista')
        const saved: List = await res.json()
        setLists(prev => updateListRecursive([...prev], saved))
        return saved
      } catch (err) {
        console.error(err)
        await fetchLists()
        throw err
      }
    },
    [fetchLists, user]
  )

  const addAndSaveList = useCallback(
  async (
    newList: Omit<List, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    const tempId = `temp-${Date.now()}`
    const optimisticList: List = {
      ...newList,
      id: tempId,
      subLists: [],
    }

    setLists(prev =>
      newList.parentId
        ? prev.map(l =>
            l.id === newList.parentId
              ? { ...l, subLists: [...(l.subLists || []), optimisticList] }
              : l
          )
        : [...prev, optimisticList]
    )

    try {
      const res = await fetch(`${API_URL}/api/lists/user/${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ list: newList }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Falha ao criar lista')

      const savedList: List = await res.json()

      setLists(prev =>
        prev.map(l =>
          l.id === savedList.parentId
            ? {
                ...l,
                subLists: l.subLists?.map(sl =>
                  sl.id === tempId ? savedList : sl
                ) || [],
              }
            : l.id === tempId
            ? savedList
            : l
        )
      )

      return savedList
    } catch (err) {
      console.error(err)
      await fetchLists()
      throw err
    }
  },
  [fetchLists, user]
)

  const deleteList = useCallback(
    async (listId: string) => {
      try {
        const res = await fetch(`${API_URL}/api/lists/user/${user?.id}?listId=${listId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Falha ao deletar lista')
        const removeRecursive = (lists: List[], id: string): List[] =>
          lists.filter(l => l.id !== id).map(l => ({ ...l, subLists: l.subLists ? removeRecursive(l.subLists, id) : [] }))
        setLists(prev => removeRecursive(prev, listId))
        return true
      } catch (err) {
        console.error(err)
        await fetchLists()
        return false
      }
    },
    [fetchLists, user]
  )

  const removeAlbumFromList = useCallback(
    async (listId: string, albumId: string) => {
      const list = getListById(listId)
      if (!list) throw new Error('Lista não encontrada')
      const updated = { ...list, albums: list.albums.filter(a => a.id !== albumId) }
      setLists(prev => updateListRecursive([...prev], updated))
      return updateList(updated)
    },
    [getListById, updateList]
  )

  const updateRootListsOrder = useCallback(
    async (newOrder: List[]) => {
      setLists(() => [...newOrder])

      try {
        const res = await fetch(`${API_URL}/api/lists/user/${user?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             orderedLists: newOrder.map(l => ({ id: l.id, position: l.position })),
          }),
          credentials: 'include',
        })

        if (!res.ok) throw new Error('Falha ao atualizar ordem')

        await fetchLists()
      } catch (err) {
        console.error(err)
        await fetchLists()
        throw err
      }
    },
    [fetchLists, user]
  )

  useEffect(() => {
    if (user?.id) fetchLists()
  }, [user, fetchLists])

  return (
    <ListContext.Provider
      value={{
        lists,
        fetchLists,
        addAndSaveList,
        updateList,
        deleteList,
        getListById,
        removeAlbumFromList,
        updateRootListsOrder
      }}
    >
      {children}
    </ListContext.Provider>
  )
}