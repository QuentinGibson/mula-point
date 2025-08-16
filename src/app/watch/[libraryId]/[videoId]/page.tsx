'use client'
import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

interface VideoSources {
  sources: {
    auto: string
    '240p': string
    '360p': string
    '720p': string
    '1080p': string
  }
  iframeUrl: string
}

export default function WatchPage({
  params
}: {
  params: Promise<{ libraryId: string; videoId: string }>
}) {
  const [resolvedParams, setResolvedParams] = useState<{ libraryId: string; videoId: string } | null>(null)
  const [videoData, setVideoData] = useState<VideoSources | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useIframe, setUseIframe] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  const video = useQuery(
    api.videos.getByLibraryAndBunnyId,
    resolvedParams ? {
      library: resolvedParams.libraryId,
      bunnyId: resolvedParams.videoId
    } : "skip"
  )

  useEffect(() => {
    if (!resolvedParams) return

    const fetchVideoData = async () => {
      try {
        const response = await fetch(`/api/video/${resolvedParams.libraryId}/${resolvedParams.videoId}`)
        if (!response.ok) throw new Error('Failed to fetch video data!')
        const data = await response.json()
        setVideoData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchVideoData()
  }, [resolvedParams])

  const toggleMute = () => {
    const video = document.querySelector('video') as HTMLVideoElement
    if (video) {
      video.muted = !video.muted
      setIsMuted(!video.muted)
    }
  }

  const toggleFullscreen = () => {
    const container = document.querySelector('.video-container') as HTMLElement
    if (!isFullscreen) {
      container?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (!resolvedParams || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Back</span>
        </button>
      </div>

      {/* Video Player Container */}
      <div className="video-container relative w-full h-screen bg-black">
        {useIframe && videoData?.iframeUrl ? (
          <iframe
            src={videoData.iframeUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : videoData?.sources ? (
          <div className="relative w-full h-full">
            <video
              className="w-full h-full"
              controls
              autoPlay
              src={videoData.sources['720p']}
            >
              <source src={videoData.sources.auto} type="application/x-mpegURL" />
              <source src={videoData.sources['1080p']} type="video/mp4" />
              <source src={videoData.sources['720p']} type="video/mp4" />
              <source src={videoData.sources['360p']} type="video/mp4" />
              <source src={videoData.sources['240p']} type="video/mp4" />
            </video>

            {/* Custom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-white/20 rounded transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    className="bg-black/50 border border-white/20 rounded px-2 py-1 text-sm"
                    onChange={(e) => {
                      const video = document.querySelector('video') as HTMLVideoElement
                      if (video && videoData) {
                        video.src = videoData.sources[e.target.value as keyof typeof videoData.sources]
                      }
                    }}
                    defaultValue="720p"
                  >
                    <option value="240p">240p</option>
                    <option value="360p">360p</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="auto">Auto</option>
                  </select>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/20 rounded transition-colors"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Video Info */}
      {video && (
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/90 to-transparent">
          <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
          {video.show && (
            <p className="text-gray-400 mb-1">{video.show.title}</p>
          )}
          {video.season && (
            <p className="text-gray-400 mb-4">{video.season.name}</p>
          )}
          <p className="text-sm text-gray-500">
            Duration: {Math.floor(video.videoLength / 60)}:{(video.videoLength % 60).toString().padStart(2, '0')}
          </p>

          {/* Player Toggle */}
          <button
            onClick={() => setUseIframe(!useIframe)}
            className="mt-4 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-sm"
          >
            Switch to {useIframe ? 'HTML5' : 'Iframe'} Player
          </button>
        </div>
      )}
    </div>
  )
}
