'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Music, Calendar, Search } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface Album {
  title: string;
  artist: string;
  artistSlug: string;
  slug: string;
  releaseDate?: string;
  genre?: string;
  totalTracks: number;
  totalViews: number;
}

export default function AlbumsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'tracks' | 'views' | 'release_date'>('title');

  // Fetch all albums
  const { data: albums, isLoading, error } = useQuery({
    queryKey: ['albums', searchQuery, sortBy],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/albums?search=${encodeURIComponent(searchQuery)}&sortBy=${sortBy}`);
      return response.data as Album[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              All Albums
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80">
              Discover albums and their track listings
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search albums or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Albums'}
          </h2>
          <div className="flex gap-2">
            {(['title', 'artist', 'tracks', 'views', 'release_date'] as const).map((option) => (
              <Button
                key={option}
                variant={sortBy === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option)}
              >
                {option === 'release_date' ? 'Release Date' : 
                 option === 'tracks' ? 'Tracks' :
                 option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Albums Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Error loading albums: {error.message}
              </p>
            </CardContent>
          </Card>
        ) : !albums?.length ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No albums found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No albums match your search for "${searchQuery}"`
                  : 'No albums have been added yet.'
                }
              </p>
              <Button asChild>
                <Link href="/songs/submit">Submit First Song</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album) => (
              <Card key={album.slug} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {/* Album Cover Placeholder */}
                  <div className="w-full h-48 bg-primary/10 rounded-lg mb-4 flex items-center justify-center">
                    <Music className="w-16 h-16 text-primary/60" />
                  </div>
                  
                  <CardTitle className="text-lg line-clamp-2">
                    <Link 
                      href={`/albums/${album.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {album.title}
                    </Link>
                  </CardTitle>
                  
                  <CardDescription>
                    <Link 
                      href={`/artists/${album.artistSlug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {album.artist}
                    </Link>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Album Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-muted-foreground" />
                      <span>{album.totalTracks} tracks</span>
                    </div>
                    <div className="text-muted-foreground">
                      {album.totalViews.toLocaleString()} views
                    </div>
                  </div>
                  
                  {/* Release Date & Genre */}
                  <div className="flex gap-2 flex-wrap">
                    {album.releaseDate && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(album.releaseDate).getFullYear()}
                      </Badge>
                    )}
                    {album.genre && (
                      <Badge variant="outline" className="text-xs">
                        {album.genre}
                      </Badge>
                    )}
                  </div>
                  
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/albums/${album.slug}`}>
                      View Album
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}