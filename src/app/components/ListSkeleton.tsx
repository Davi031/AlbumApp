export const ListSkeleton = () => {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white animate-pulse">
      <div className="p-4 flex flex-row justify-between items-center gap-2">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        <div className="flex gap-2">
          <div className="h-5 w-5 bg-gray-300 rounded"></div>
          <div className="h-5 w-5 bg-gray-300 rounded"></div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  )
}