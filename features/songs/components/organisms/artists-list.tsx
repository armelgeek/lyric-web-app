'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Music, Users, Search } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import slugify from 'slugify';

interface Artist {
  name: string;
  slug: string;
  totalSongs: number;
  totalViews: number;
  followers: number;
  genres: string[];
  isVerified: boolean;
}

export default function ArtistsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'songs' | 'views'>('name');

  // Fetch all artists
  const { data: artists, isLoading, error } = useQuery({
    queryKey: ['artists', searchQuery, sortBy],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/artists?search=${encodeURIComponent(searchQuery)}&sortBy=${sortBy}`);
      return response.data as Artist[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              All Artists
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80">
              Discover artists and their lyrics on our platform
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search artists..."
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
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Artists'}
          </h2>
          <div className="flex gap-2">
            {(['name', 'songs', 'views'] as const).map((option) => (
              <Button
                key={option}
                variant={sortBy === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option)}
              >
                {option === 'name' ? 'Name' : option === 'songs' ? 'Songs' : 'Views'}
              </Button>
            ))}
          </div>
        </div>

        {/* Artists Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-20 h-20 bg-muted rounded-lg mx-auto"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
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
                Error loading artists: {error.message}
              </p>
            </CardContent>
          </Card>
        ) : !artists?.length ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No artists found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No artists match your search for "${searchQuery}"`
                  : 'No artists have been added yet.'
                }
              </p>
              <Button asChild>
                <Link href="/songs/submit">Submit First Song</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artists.map((artist) => (
              <Card key={artist.slug} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  {/* Artist Avatar Placeholder */}
                  <div className="w-20 h-20 bg-primary/10 rounded-lg mx-auto flex items-center justify-center mb-3">
                    <Music className="w-10 h-10 text-primary/60" />
                  </div>
                  
                  <CardTitle className="text-lg">
                    <Link 
                      href={`/artists/${artist.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {artist.name}
                    </Link>
                  </CardTitle>
                  
                  {artist.isVerified && (
                    <Badge variant="secondary" className="mx-auto w-fit">
                      Verified
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-muted-foreground" />
                      <span>{artist.totalSongs} songs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{artist.totalViews.toLocaleString()} views</span>
                    </div>
                  </div>
                  
                  {/* Genres */}
                  {artist.genres.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {artist.genres.slice(0, 3).map((genre) => (
                        <Badge key={genre} variant="outline" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                      {artist.genres.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{artist.genres.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/artists/${artist.slug}`}>
                      View Artist
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