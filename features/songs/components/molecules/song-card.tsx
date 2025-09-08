import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { SongWithUser } from '../../config/song.types';

interface SongCardProps {
  song: SongWithUser;
  showStats?: boolean;
}

export function SongCard({ song, showStats = true }: SongCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <Link href={`/songs/${song.slug}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-1">{song.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{song.artist}</p>
          {song.album && (
            <p className="text-xs text-muted-foreground">{song.album}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {song.genre && (
              <Badge variant="secondary" className="text-xs">
                {song.genre}
              </Badge>
            )}
            
            <p className="text-sm text-muted-foreground line-clamp-3">
              {song.lyrics.substring(0, 150)}...
            </p>
            
            {showStats && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {song.views}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {song.likes}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {song.commentsCount}
                </div>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              by {song.submittedByUser.name}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}