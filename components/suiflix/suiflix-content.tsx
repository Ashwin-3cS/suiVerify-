"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SuiFlixContent() {
  // Sample movie data
  const movies = [
    {
      id: 1,
      title: "Crypto Heist",
      category: "Action",
      rating: "18+",
      image: "/placeholder.svg?height=400&width=300",
    },
    {
      id: 2,
      title: "Blockchain Boulevard",
      category: "Drama",
      rating: "18+",
      image: "/placeholder.svg?height=400&width=300",
    },
    {
      id: 3,
      title: "NFT Nightmare",
      category: "Horror",
      rating: "18+",
      image: "/placeholder.svg?height=400&width=300",
    },
    {
      id: 4,
      title: "Metaverse Madness",
      category: "Sci-Fi",
      rating: "18+",
      image: "/placeholder.svg?height=400&width=300",
    },
    {
      id: 5,
      title: "DeFi Diaries",
      category: "Documentary",
      rating: "18+",
      image: "/placeholder.svg?height=400&width=300",
    },
    {
      id: 6,
      title: "Web3 Warriors",
      category: "Adventure",
      rating: "18+",
      image: "/placeholder.svg?height=400&width=300",
    },
    {
      id: 7,
      title: "Sui Protocol",
      category: "Documentary",
      rating: "18+",
      image: "/placeholder.svg?height=400&width=300",
    },
    {
      id: 8,
      title: "Zero Knowledge",
      category: "Mystery",
      rating: "18+",
      image: "/placeholder.svg?height=400&width=300",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">Age-Restricted Content</h2>
      <p className="text-gray-400 mb-8">
        Your age has been verified through SuiVerify. You now have access to all 18+ content.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}

interface Movie {
  id: number
  title: string
  category: string
  rating: string
  image: string
}

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden hover:shadow-lg hover:shadow-violet-900/20 transition-all duration-300">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.image || "/placeholder.svg"}
          alt={movie.title}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
        <Badge className="absolute top-2 right-2 bg-red-600">{movie.rating}</Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-white">{movie.title}</h3>
        <p className="text-sm text-gray-400">{movie.category}</p>
      </CardContent>
    </Card>
  )
}
