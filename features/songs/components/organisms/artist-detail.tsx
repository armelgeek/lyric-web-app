'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Users, Calendar, ExternalLink, Verified } from 'lucide-react';
import Link from 'next/link';
import { SimpleSongList } from '../molecules/simple-song-list';
import axios from 'axios';

interface Artist {
  name: string;
  slug: string;
  bio?: string;
  isVerified: boolean;
  totalSongs: number;
  totalViews: number;
  followers: number;
  spotifyUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
  genres: string[];
  debutYear?: number;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  releaseDate?: string;
  genre?: string;
  views: number;
  likes: number;
  annotationsCount: number;
  slug: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
  createdAt: string;
}

interface ArtistDetailProps {
  slug: string;
}

export default function ArtistDetail({ slug }: ArtistDetailProps) {
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'title' | 'created_at'>('views');
  
  // Fetch artist data
  const { data: artist, isLoading: artistLoading, error: artistError } = useQuery({
    queryKey: ['artist', slug],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/artists/${slug}`);
      return response.data as Artist;
    },
  });

  // Fetch artist's songs
  const { data: songs, isLoading: songsLoading, error: songsError } = useQuery({
    queryKey: ['artist-songs', slug, sortBy],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/artists/${slug}/songs?sortBy=${sortBy}&sortOrder=desc`);
      return response.data as Song[];
    },
    enabled: !!artist,
  });

  if (artistLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (artistError || !artist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Artist Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The artist you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-6">
              {/* Artist Avatar/Image Placeholder */}
              <div className="w-32 h-32 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <Music className="w-16 h-16 text-primary-foreground/60" />
              </div>
              
              {/* Artist Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold">{artist.name}</h1>
                  {artist.isVerified && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Verified className="w-3 h-3" />
                      Verified Artist
                    </Badge>
                  )}
                </div>
                
                {artist.bio && (
                  <p className="text-primary-foreground/80 text-lg max-w-2xl">
                    {artist.bio}
                  </p>
                )}
                
                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>{artist.totalSongs} Songs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{artist.followers.toLocaleString()} Followers</span>
                  </div>
                  {artist.debutYear && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Since {artist.debutYear}</span>
                    </div>
                  )}
                </div>
                
                {/* Genres */}
                {artist.genres.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {artist.genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="bg-primary-foreground/10">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* External Links */}
                <div className="flex gap-3">
                  {artist.spotifyUrl && (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={artist.spotifyUrl} target="_blank">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Spotify
                      </Link>
                    </Button>
                  )}
                  {artist.youtubeUrl && (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={artist.youtubeUrl} target="_blank">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        YouTube
                      </Link>
                    </Button>
                  )}
                  {artist.appleMusicUrl && (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={artist.appleMusicUrl} target="_blank">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Apple Music
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="songs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="songs" className="space-y-6">
            {/* Sort Controls */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Songs by {artist.name}</h2>
              <div className="flex gap-2">
                {(['views', 'likes', 'title', 'created_at'] as const).map((option) => (
                  <Button
                    key={option}
                    variant={sortBy === option ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy(option)}
                  >
                    {option === 'created_at' ? 'Latest' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Songs List */}
            {songsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
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
            ) : songsError ? (
              <Card>
                <CardContent className="py-6">
                  <p className="text-center text-muted-foreground">
                    Error loading songs: {songsError.message}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <SimpleSongList 
                songs={songs || []} 
                emptyMessage={`No songs found for ${artist.name}. Be the first to submit their lyrics!`}
              />
            )}
          </TabsContent>

          <TabsContent value="albums" className="space-y-6">
            <h2 className="text-2xl font-bold">Albums by {artist.name}</h2>
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Albums feature coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <h2 className="text-2xl font-bold">About {artist.name}</h2>
            <Card>
              <CardContent className="py-6">
                {artist.bio ? (
                  <div className="prose max-w-none">
                    <p>{artist.bio}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No biography available for {artist.name}.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}