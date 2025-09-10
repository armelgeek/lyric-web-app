'use client';

import { useState } from 'react';
import { Heart, MessageSquare, Share2, Flag, Eye, Plus, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSong } from '@/features/songs/hooks/use-songs';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface SongDetailContentProps {
  slug: string;
}

export default function SongDetailContent({ slug }: SongDetailContentProps) {
  const { data: song, isLoading, error } = useSong(slug);
  const [newComment, setNewComment] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Song Not Found</h1>
            <p className="text-muted-foreground">The song you're looking for doesn't exist.</p>
            <Link href="/search">
              <Button>Back to Search</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      setSelectedText(selection);
      setShowAnnotationForm(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Song Header */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{song.title}</h1>
                <div className="flex items-center gap-2 text-lg text-muted-foreground">
                  <span>by</span>
                  <Link href={`/search?artist=${encodeURIComponent(song.artist)}`} className="hover:underline">
                    {song.artist}
                  </Link>
                </div>
                {song.album && (
                  <p className="text-muted-foreground">from <em>{song.album}</em></p>
                )}
              </div>

              <div className="flex items-center gap-4">
                {song.genre && (
                  <Badge variant="secondary">
                    {song.genre.charAt(0).toUpperCase() + song.genre.slice(1)}
                  </Badge>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {song.views.toLocaleString()} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {song.likes.toLocaleString()} likes
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {song.commentsCount} comments
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4 mr-1" />
                  Like
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Favorite
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Flag className="w-4 h-4 mr-1" />
                  Report
                </Button>
              </div>
            </div>

            <Separator />

            {/* Lyrics */}
            <Card>
              <CardHeader>
                <CardTitle>Lyrics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select text to add annotations and explanations
                </p>
              </CardHeader>
              <CardContent>
                <div 
                  className="whitespace-pre-line text-lg leading-relaxed cursor-text select-text"
                  onMouseUp={handleTextSelection}
                >
                  {song.lyrics}
                </div>
              </CardContent>
            </Card>

            {/* Annotation Form */}
            {showAnnotationForm && selectedText && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Annotation</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Selected text: &quot;{selectedText}&quot;
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Explain the meaning of this lyric..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm">Submit Annotation</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAnnotationForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Annotations */}
            {song.annotations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Annotations ({song.annotations.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {song.annotations.map((annotation) => (
                    <div key={annotation.id} className="space-y-2 p-4 border rounded-lg">
                      <div className="font-medium text-sm">
                        &quot;{annotation.highlightedText}&quot;
                      </div>
                      <p className="text-sm">{annotation.explanation}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>by User {annotation.userId}</span>
                          <span>{formatDistanceToNow(annotation.createdAt)} ago</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {annotation.upvotes}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ThumbsDown className="w-3 h-3 mr-1" />
                            {annotation.downvotes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Comments ({song.comments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Share your thoughts about this song..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button size="sm">Post Comment</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  {song.comments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">User {comment.userId}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(comment.createdAt)} ago
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Heart className="w-3 h-3 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Song Info */}
            <Card>
              <CardHeader>
                <CardTitle>Song Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Artist:</span>
                  <span>{song.artist}</span>
                </div>
                {song.album && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Album:</span>
                    <span>{song.album}</span>
                  </div>
                )}
                {song.genre && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Genre:</span>
                    <span>{song.genre}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted by:</span>
                  <span>{song.submittedByUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added:</span>
                  <span>{formatDistanceToNow(song.createdAt)} ago</span>
                </div>
              </CardContent>
            </Card>

            {/* External Links */}
            {(song.spotifyUrl || song.youtubeUrl || song.appleMusicUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Listen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {song.spotifyUrl && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer">
                        Spotify
                      </a>
                    </Button>
                  )}
                  {song.youtubeUrl && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer">
                        YouTube
                      </a>
                    </Button>
                  )}
                  {song.appleMusicUrl && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={song.appleMusicUrl} target="_blank" rel="noopener noreferrer">
                        Apple Music
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}