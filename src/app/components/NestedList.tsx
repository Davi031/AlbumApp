'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FixedList } from '../../types'

export const NestedList = ({ list, depth = 0 }: { list: FixedList, depth?: number }) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(depth < 2) 

  const hasSublists = list.subLists && list.subLists.length > 0

  return (
    <div className={`${depth > 0 ? 'ml-3 sm:ml-4 mt-1' : 'mt-2'}`}>
      <div 
        className={`flex items-center justify-between p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
          depth === 0 ? 'bg-white border border-gray-200' : 'bg-gray-50'
        }`}
        onClick={() => router.push(`/lists/${list.id}`)}
      >
        <span className={`font-medium text-sm sm:text-base text-gray-600`}>
          {list.name}
        </span>
        
        {hasSublists && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
            className="p-1 sm:p-2 text-gray-800 hover:text-gray-700"
            aria-label={isOpen ? 'Recolher sublistas' : 'Expandir sublistas'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform ${isOpen ? 'rotate-90' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && hasSublists && (
        <div className="border-l-2 border-gray-200 ml-3 pl-2">
          {list.subLists.map((sublist) => (
            <NestedList key={sublist.id} list={sublist} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}