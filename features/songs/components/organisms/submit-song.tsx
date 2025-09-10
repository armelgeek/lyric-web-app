'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Music, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSongSchema } from '@/features/songs/config/song.schema';
import { CreateSongPayload } from '@/features/songs/config/song.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

const genres = [
  'pop', 'rock', 'hip-hop', 'r&b', 'country', 'jazz', 'blues', 'electronic',
  'folk', 'classical', 'reggae', 'punk', 'metal', 'indie', 'alternative', 'other'
];

export default function SubmitSongContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPreview, setIsPreview] = useState(false);

  const form = useForm<CreateSongPayload>({
    resolver: zodResolver(createSongSchema),
    defaultValues: {
      title: '',
      artist: '',
      album: '',
      lyrics: '',
      genre: undefined,
      spotifyUrl: '',
      youtubeUrl: '',
      appleMusicUrl: '',
    },
  });

  const createSongMutation = useMutation({
    mutationFn: async (data: CreateSongPayload) => {
      const response = await axios.post('/api/v1/songs', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast.success('Song submitted successfully! It will be reviewed before publication.');
      router.push(`/songs/${data.data.slug}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit song');
    },
  });

  const onSubmit = (data: CreateSongPayload) => {
    createSongMutation.mutate(data);
  };

  const watchedValues = form.watch();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center gap-2">
              <Music className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Submit Song Lyrics</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Share your favorite song lyrics with the community. Please ensure you have the right to share these lyrics 
              and they don't violate any copyright restrictions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Song Information</CardTitle>
                <CardDescription>
                  Fill in the details about the song you want to submit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Song Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter song title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Artist */}
                    <FormField
                      control={form.control}
                      name="artist"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Artist *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter artist name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Album */}
                    <FormField
                      control={form.control}
                      name="album"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Album</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter album name (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Genre */}
                    <FormField
                      control={form.control}
                      name="genre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a genre" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genres.map((genre) => (
                                <SelectItem key={genre} value={genre}>
                                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Lyrics */}
                    <FormField
                      control={form.control}
                      name="lyrics"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lyrics *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter the song lyrics..."
                              rows={12}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Please ensure you have the right to share these lyrics
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* External Links */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">External Links (Optional)</h3>
                      
                      <FormField
                        control={form.control}
                        name="spotifyUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spotify URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://open.spotify.com/..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="youtubeUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://youtube.com/..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="appleMusicUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apple Music URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://music.apple.com/..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={createSongMutation.isPending}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {createSongMutation.isPending ? 'Submitting...' : 'Submit Song'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPreview(!isPreview)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Preview */}
            {(isPreview || watchedValues.title || watchedValues.artist) && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    This is how your song will appear on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {watchedValues.title || 'Song Title'}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        by {watchedValues.artist || 'Artist Name'}
                      </p>
                      {watchedValues.album && (
                        <p className="text-sm text-muted-foreground">
                          from <em>{watchedValues.album}</em>
                        </p>
                      )}
                    </div>

                    {watchedValues.genre && (
                      <div>
                        <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                          {watchedValues.genre.charAt(0).toUpperCase() + watchedValues.genre.slice(1)}
                        </span>
                      </div>
                    )}

                    {watchedValues.lyrics && (
                      <div>
                        <h3 className="font-medium mb-2">Lyrics</h3>
                        <div className="whitespace-pre-line text-sm bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                          {watchedValues.lyrics}
                        </div>
                      </div>
                    )}

                    {(watchedValues.spotifyUrl || watchedValues.youtubeUrl || watchedValues.appleMusicUrl) && (
                      <div>
                        <h3 className="font-medium mb-2">Listen</h3>
                        <div className="space-y-2">
                          {watchedValues.spotifyUrl && (
                            <div className="text-sm text-muted-foreground">
                              🎵 Spotify: Available
                            </div>
                          )}
                          {watchedValues.youtubeUrl && (
                            <div className="text-sm text-muted-foreground">
                              📺 YouTube: Available
                            </div>
                          )}
                          {watchedValues.appleMusicUrl && (
                            <div className="text-sm text-muted-foreground">
                              🍎 Apple Music: Available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Guidelines */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Submission Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p><strong>Copyright Notice:</strong> Only submit lyrics that you have the right to share. Do not submit copyrighted lyrics without proper authorization.</p>
                <p><strong>Quality:</strong> Please ensure lyrics are accurate and properly formatted.</p>
                <p><strong>Review Process:</strong> All submissions are reviewed by our moderation team before publication.</p>
                <p><strong>Community Guidelines:</strong> Be respectful and follow our community standards.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}