'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Calendar, ExternalLink, Clock, Play } from 'lucide-react';
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
  spotifyUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  trackNumber?: number;
  duration?: string;
  views: number;
  likes: number;
  annotationsCount: number;
  slug: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
  createdAt: string;
}

interface AlbumDetailProps {
  slug: string;
}

export default function AlbumDetail({ slug }: AlbumDetailProps) {
  // Fetch album data
  const { data: album, isLoading: albumLoading, error: albumError } = useQuery({
    queryKey: ['album', slug],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/albums/${slug}`);
      return response.data as Album;
    },
  });

  // Fetch album's tracks
  const { data: tracks, isLoading: tracksLoading, error: tracksError } = useQuery({
    queryKey: ['album-tracks', slug],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/albums/${slug}/tracks`);
      return response.data as Song[];
    },
    enabled: !!album,
  });

  if (albumLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex gap-6">
            <div className="w-64 h-64 bg-muted rounded-lg"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (albumError || !album) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Album Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The album you're looking for doesn't exist or has been removed.
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
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Album Cover Placeholder */}
              <div className="w-64 h-64 bg-primary-foreground/20 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                <Music className="w-24 h-24 text-primary-foreground/60" />
              </div>
              
              {/* Album Info */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="space-y-2">
                  <p className="text-primary-foreground/80 text-sm uppercase tracking-wider">Album</p>
                  <h1 className="text-4xl md:text-6xl font-bold">{album.title}</h1>
                  <p className="text-xl md:text-2xl text-primary-foreground/90">
                    by{' '}
                    <Link 
                      href={`/artists/${album.artistSlug}`}
                      className="hover:text-primary-foreground underline"
                    >
                      {album.artist}
                    </Link>
                  </p>
                </div>
                
                {/* Album Details */}
                <div className="flex flex-wrap gap-4 text-sm justify-center md:justify-start">
                  {album.releaseDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(album.releaseDate).getFullYear()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>{album.totalTracks} tracks</span>
                  </div>
                  {album.genre && (
                    <Badge variant="outline" className="bg-primary-foreground/10">
                      {album.genre}
                    </Badge>
                  )}
                </div>
                
                {/* External Links */}
                <div className="flex gap-3 justify-center md:justify-start">
                  {album.spotifyUrl && (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={album.spotifyUrl} target="_blank">
                        <Play className="w-4 h-4 mr-2" />
                        Spotify
                      </Link>
                    </Button>
                  )}
                  {album.youtubeUrl && (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={album.youtubeUrl} target="_blank">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        YouTube
                      </Link>
                    </Button>
                  )}
                  {album.appleMusicUrl && (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={album.appleMusicUrl} target="_blank">
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

      {/* Tracklist */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">Tracklist</h2>
          
          {tracksLoading ? (
            <div className="space-y-2">
              {Array.from({ length: album.totalTracks || 10 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-4 bg-muted rounded"></div>
                      <div className="flex-1 h-4 bg-muted rounded"></div>
                      <div className="w-16 h-4 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tracksError ? (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  Error loading tracks: {tracksError.message}
                </p>
              </CardContent>
            </Card>
          ) : !tracks?.length ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tracks found</h3>
                <p className="text-muted-foreground">
                  No tracks have been added to this album yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <Card key={track.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      {/* Track Number */}
                      <div className="w-8 text-center text-muted-foreground font-mono">
                        {track.trackNumber || index + 1}
                      </div>
                      
                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/songs/${track.slug}`}
                          className="font-medium hover:text-primary transition-colors block truncate"
                        >
                          {track.title}
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{track.views.toLocaleString()} views</span>
                          <span>{track.likes} likes</span>
                          {track.annotationsCount > 0 && (
                            <span>{track.annotationsCount} annotations</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Duration */}
                      {track.duration && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{track.duration}</span>
                        </div>
                      )}
                      
                      {/* External Links */}
                      <div className="flex gap-2">
                        {track.spotifyUrl && (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={track.spotifyUrl} target="_blank">
                              <Play className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                        {track.youtubeUrl && (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={track.youtubeUrl} target="_blank">
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}