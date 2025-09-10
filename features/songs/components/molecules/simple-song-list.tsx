'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, Heart, Eye, MessageSquare, ExternalLink, Play } from 'lucide-react';
import Link from 'next/link';

interface SimpleSong {
  id: string;
  title: string;
  artist: string;
  album?: string;
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

interface SimpleSongListProps {
  songs: SimpleSong[];
  title?: string;
  emptyMessage?: string;
}

export function SimpleSongList({ songs, title, emptyMessage = 'No songs found' }: SimpleSongListProps) {
  if (songs.length === 0) {
    return (
      <div className="space-y-4">
        {title && (
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        )}
        <Card>
          <CardContent className="py-8 text-center">
            <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song) => (
          <Card key={song.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">
                <Link 
                  href={`/songs/${song.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {song.title}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {song.artist}
                {song.album && ` • ${song.album}`}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Genre */}
              {song.genre && (
                <Badge variant="outline" className="w-fit">
                  {song.genre}
                </Badge>
              )}
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{song.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{song.likes}</span>
                </div>
                {song.annotationsCount > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{song.annotationsCount}</span>
                  </div>
                )}
              </div>
              
              {/* External Links */}
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/songs/${song.slug}`}>
                    View Lyrics
                  </Link>
                </Button>
                
                {song.spotifyUrl && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={song.spotifyUrl} target="_blank">
                      <Play className="w-4 h-4" />
                    </Link>
                  </Button>
                )}
                
                {song.youtubeUrl && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={song.youtubeUrl} target="_blank">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}