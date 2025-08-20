"use client"

import { useParams } from "next/navigation"
import { ArrowLeft, Play, Plus, Info, ChevronDown, Star, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

function ShowDetailsPage() {
  const params = useParams<{ id: string }>()
  const [selectedSeason, setSelectedSeason] = useState("1")
  const [isInWatchlist, setIsInWatchlist] = useState(false)

  // Mock data - replace with actual data fetching from Convex
  const show = {
    id: params.id,
    title: "Breaking Bad",
    description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    posterUrl: "/api/placeholder/400/600",
    backdropUrl: "/api/placeholder/1920/1080",
    rating: 9.5,
    year: 2008,
    endYear: 2013,
    genres: ["Crime", "Drama", "Thriller"],
    contentRating: "TV-MA",
    seasons: 5,
    totalEpisodes: 62,
    episodeRuntime: "45-60 min",
    creator: "Vince Gilligan",
    cast: [
      { name: "Bryan Cranston", role: "Walter White" },
      { name: "Aaron Paul", role: "Jesse Pinkman" },
      { name: "Anna Gunn", role: "Skyler White" },
      { name: "RJ Mitte", role: "Walter White Jr." }
    ]
  }

  // Mock episodes data
  const seasons: Record<string, Array<{id: string, number: number, title: string, duration: string, synopsis: string, thumbnail: string}>> = {
    "1": [
      { id: "e1", number: 1, title: "Pilot", duration: "58 min", synopsis: "Diagnosed with terminal cancer, a high school teacher tries to secure his family's future by producing crystal meth.", thumbnail: "/api/placeholder/320/180" },
      { id: "e2", number: 2, title: "Cat's in the Bag...", duration: "48 min", synopsis: "Walt and Jesse attempt to tie up loose ends. The DEA gets involved.", thumbnail: "/api/placeholder/320/180" },
      { id: "e3", number: 3, title: "...And the Bag's in the River", duration: "48 min", synopsis: "Walt and Jesse clean up after their deadly encounter with Krazy-8.", thumbnail: "/api/placeholder/320/180" },
      { id: "e4", number: 4, title: "Cancer Man", duration: "48 min", synopsis: "Walt tells the rest of his family about his cancer. Jesse tries to make amends.", thumbnail: "/api/placeholder/320/180" },
      { id: "e5", number: 5, title: "Gray Matter", duration: "48 min", synopsis: "Walt rejects everyone who tries to help him with the cancer.", thumbnail: "/api/placeholder/320/180" },
      { id: "e6", number: 6, title: "Crazy Handful of Nothin'", duration: "48 min", synopsis: "Walt and Jesse are reminded of Tuco's volatile nature.", thumbnail: "/api/placeholder/320/180" },
      { id: "e7", number: 7, title: "A No-Rough-Stuff-Type Deal", duration: "48 min", synopsis: "Walt and Jesse try to up their game.", thumbnail: "/api/placeholder/320/180" }
    ],
    "2": [
      { id: "e8", number: 1, title: "Seven Thirty-Seven", duration: "47 min", synopsis: "Walt and Jesse realize how dire their situation is.", thumbnail: "/api/placeholder/320/180" },
      { id: "e9", number: 2, title: "Grilled", duration: "46 min", synopsis: "Walt's disappearance is met with investigation.", thumbnail: "/api/placeholder/320/180" },
      { id: "e10", number: 3, title: "Bit by a Dead Bee", duration: "47 min", synopsis: "Walt and Jesse cover their tracks.", thumbnail: "/api/placeholder/320/180" }
    ]
  }

  const currentSeasonEpisodes = seasons[selectedSeason] || []

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <img
          src={show.backdropUrl}
          alt={show.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Content Overlay */}
        <div className="relative z-20 container mx-auto px-4 h-full flex items-end pb-8">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-end">
            {/* Poster */}
            <div className="hidden md:block">
              <img
                src={show.posterUrl}
                alt={show.title}
                className="w-full rounded-lg shadow-2xl"
              />
            </div>

            {/* Show Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{show.title}</h1>
                <div className="flex items-center gap-3 text-white/80">
                  <Badge variant="secondary">{show.contentRating}</Badge>
                  <span>{show.year} - {show.endYear}</span>
                  <span>•</span>
                  <span>{show.seasons} Seasons</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span>{show.rating}/10</span>
                  </div>
                </div>
              </div>

              <p className="text-white/90 max-w-3xl">{show.description}</p>

              <div className="flex gap-3">
                <Link href={`/watch/${params.id}/1/1`}>
                  <Button size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    Watch S1 E1
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant={isInWatchlist ? "secondary" : "outline"}
                  onClick={() => setIsInWatchlist(!isInWatchlist)}
                  className="gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {show.genres.map((genre) => (
                  <Badge key={genre} variant="outline" className="text-white border-white/30">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
            <TabsTrigger value="similar">Similar Shows</TabsTrigger>
          </TabsList>

          {/* Episodes Tab */}
          <TabsContent value="episodes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Episodes</h2>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: show.seasons }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      Season {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {currentSeasonEpisodes.map((episode: {id: string, number: number, title: string, duration: string, synopsis: string, thumbnail: string}) => (
                <Card key={episode.id} className="overflow-hidden hover:bg-muted/50 transition-colors">
                  <Link href={`/watch/480813/b7ed01f6-31ec-4563-aabe-689f489b2d8d`}>
                    <CardContent className="p-0">
                      <div className="flex gap-4">
                        <div className="relative w-48 flex-shrink-0">
                          <div className="aspect-video bg-muted">
                            <img
                              src={episode.thumbnail}
                              alt={episode.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">
                                {episode.number}. {episode.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">{episode.duration}</p>
                            </div>
                          </div>
                          <p className="mt-2 text-sm line-clamp-2">{episode.synopsis}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Cast Tab */}
          <TabsContent value="cast" className="space-y-6">
            <h2 className="text-2xl font-semibold">Cast & Crew</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Creator</h3>
                <p className="text-muted-foreground">{show.creator}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Main Cast</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {show.cast.map((member) => (
                    <div key={member.name} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-full" />
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Similar Shows Tab */}
          <TabsContent value="similar" className="space-y-6">
            <h2 className="text-2xl font-semibold">Similar Shows</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Link key={i} href={`/videos/${i}`} className="group">
                  <div className="space-y-2">
                    <div className="aspect-[2/3] bg-muted rounded-md overflow-hidden">
                      <img
                        src={`/api/placeholder/200/300`}
                        alt={`Similar show ${i}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="font-medium text-sm line-clamp-1">Similar Show {i}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ShowDetailsPage
