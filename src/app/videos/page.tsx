'use client'
import { usePaginatedQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useEffect, useRef } from "react"
import Link from "next/link"

function VideoPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.shows.listPage,
    {},
    { initialNumItems: 20 }
  )

  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loadMoreRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && status === "CanLoadMore") {
          loadMore(20)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [status, loadMore])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Browse Shows</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((show) => (
            <Link
              key={show._id}
              className="group relative cursor-pointer transition-transform hover:scale-105"
              href={`/videos/${show._id}`}
            >
              <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden">
                {show.largeThumbnail ? (
                  <img
                    src={`/api/storage/${show.largeThumbnail}`}
                    alt={show.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                    <span className="text-white/80 text-center px-2 font-medium">
                      {show.title}
                    </span>
                  </div>
                )}

                {show.isNew && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">
                    NEW
                  </div>
                )}
              </div>

              <div className="mt-2">
                <h3 className="text-sm font-medium truncate group-hover:text-blue-400 transition-colors">
                  {show.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {show.releaseDate}
                </p>
              </div>

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg pointer-events-none" />
            </Link>
          ))}
        </div>

        {status === "LoadingMore" && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        <div ref={loadMoreRef} className="h-20" />

        {status === "Exhausted" && results.length > 0 && (
          <p className="text-center text-gray-400 mt-8">
            You've reached the end of the catalog
          </p>
        )}

        {results.length === 0 && status === "Exhausted" && (
          <p className="text-center text-gray-400 mt-8">
            No shows available yet
          </p>
        )}
      </div>
    </div>
  )
}

export default VideoPage
