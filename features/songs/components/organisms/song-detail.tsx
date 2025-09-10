'use client';

import { useState } from 'react';
import { Heart, MessageSquare, Share2, Flag, Eye, Plus, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSong, useLikeSong, useFavoriteSong } from '@/features/songs/hooks/use-songs';
import { useCreateAnnotation, useVoteAnnotation } from '@/features/songs/hooks/use-annotations';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

interface SongDetailContentProps {
  slug: string;
}

export default function SongDetailContent({ slug }: SongDetailContentProps) {
  const { data: song, isLoading, error } = useSong(slug);
  const [newComment, setNewComment] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [annotationText, setAnnotationText] = useState('');

  const likeMutation = useLikeSong();
  const favoriteMutation = useFavoriteSong();
  const createAnnotationMutation = useCreateAnnotation();
  const voteAnnotationMutation = useVoteAnnotation();

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
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString();
      const range = selection.getRangeAt(0);
      
      // Calculate position in the full lyrics text
      const lyricsElement = document.getElementById('lyrics-text');
      if (lyricsElement) {
        const startOffset = getTextOffset(lyricsElement, range.startContainer, range.startOffset);
        const endOffset = getTextOffset(lyricsElement, range.endContainer, range.endOffset);
        
        setSelectedText(selectedText);
        setSelectionRange({ start: startOffset, end: endOffset });
        setShowAnnotationDialog(true);
      }
    }
  };

  const getTextOffset = (root: Node, node: Node, offset: number): number => {
    let walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let currentOffset = 0;
    let currentNode;
    
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return currentOffset + offset;
      }
      currentOffset += currentNode.textContent?.length || 0;
    }
    
    return currentOffset;
  };

  const handleCreateAnnotation = async () => {
    if (!selectionRange || !selectedText || !annotationText.trim()) return;

    try {
      await createAnnotationMutation.mutateAsync({
        songId: song.id,
        highlightedText: selectedText,
        startPosition: selectionRange.start,
        endPosition: selectionRange.end,
        explanation: annotationText,
      });
      
      setShowAnnotationDialog(false);
      setSelectedText('');
      setSelectionRange(null);
      setAnnotationText('');
      toast.success('Annotation added successfully!');
    } catch (error) {
      toast.error('Failed to create annotation');
    }
  };

  const handleLike = async () => {
    try {
      await likeMutation.mutateAsync(song.id);
    } catch (error) {
      toast.error('Failed to like song');
    }
  };

  const handleFavorite = async () => {
    try {
      await favoriteMutation.mutateAsync(song.id);
    } catch (error) {
      toast.error('Failed to favorite song');
    }
  };

  const handleVoteAnnotation = async (annotationId: string, isUpvote: boolean) => {
    try {
      await voteAnnotationMutation.mutateAsync({ annotationId, isUpvote });
    } catch (error) {
      toast.error('Failed to vote on annotation');
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
                    <Heart className={`w-4 h-4 ${song.isLikedByUser ? 'fill-red-500 text-red-500' : ''}`} />
                    {song.likes.toLocaleString()} likes
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {song.commentsCount} comments
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={song.isLikedByUser ? 'bg-red-50 border-red-200' : ''}
                >
                  <Heart className={`w-4 h-4 mr-1 ${song.isLikedByUser ? 'fill-red-500 text-red-500' : ''}`} />
                  {song.isLikedByUser ? 'Liked' : 'Like'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleFavorite}
                  disabled={favoriteMutation.isPending}
                  className={song.isFavoriteByUser ? 'bg-yellow-50 border-yellow-200' : ''}
                >
                  <Plus className={`w-4 h-4 mr-1 ${song.isFavoriteByUser ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  {song.isFavoriteByUser ? 'Favorited' : 'Favorite'}
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
                  id="lyrics-text"
                  className="whitespace-pre-line text-lg leading-relaxed cursor-text select-text"
                  onMouseUp={handleTextSelection}
                >
                  {song.lyrics}
                </div>
              </CardContent>
            </Card>

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
                          <span>by {annotation.user.name}</span>
                          <span>{formatDistanceToNow(annotation.createdAt)} ago</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleVoteAnnotation(annotation.id, true)}
                            disabled={voteAnnotationMutation.isPending}
                            className={annotation.isUpvotedByUser ? 'bg-green-50 text-green-600' : ''}
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {annotation.upvotes}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleVoteAnnotation(annotation.id, false)}
                            disabled={voteAnnotationMutation.isPending}
                            className={annotation.isDownvotedByUser ? 'bg-red-50 text-red-600' : ''}
                          >
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

      {/* Annotation Dialog */}
      <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Annotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Selected text:</label>
              <div className="p-2 bg-muted rounded text-sm mt-1">
                &quot;{selectedText}&quot;
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Explanation:</label>
              <Textarea
                placeholder="Explain the meaning of this lyric..."
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowAnnotationDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAnnotation}
                disabled={createAnnotationMutation.isPending || !annotationText.trim()}
              >
                {createAnnotationMutation.isPending ? 'Adding...' : 'Add Annotation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}