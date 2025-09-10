'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, MessageSquare, Heart, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrendingSongs } from '@/features/songs/hooks/use-songs';
import Link from 'next/link';

export default function StaticLyricsHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { data: trendingSongs, isLoading } = useTrendingSongs(6);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Discover Lyrics, Share Stories
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80">
              The platform where music lovers explore, annotate, and discuss their favorite songs
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search songs, artists, or lyrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 bg-background text-foreground"
                />
              </div>
              <Button type="submit" variant="secondary" onClick={handleSearch}>
                Search
              </Button>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center">
              <Link href="/submit">
                <Button variant="secondary" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Lyrics
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" size="lg">
                  Explore All Songs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Trending Songs */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Trending Songs</h2>
            <Link href="/search">
              <Button variant="outline">
                View All
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-16"></div>
                      <div className="h-12 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trendingSongs && trendingSongs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingSongs.map((song) => (
                <Link key={song.id} href={`/songs/${song.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
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
                            {song.genre.charAt(0).toUpperCase() + song.genre.slice(1)}
                          </Badge>
                        )}
                        
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {song.lyrics.substring(0, 150)}...
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {song.views.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {song.likes.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {song.commentsCount}
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          by {song.submittedByUser.name}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No trending songs available yet.</p>
              <Link href="/submit">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Be the first to submit lyrics
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Features */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-center">
            What Makes Our Platform Special
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Discover & Search
                </CardTitle>
                <CardDescription>
                  Find lyrics to your favorite songs or discover new music through our powerful search
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Annotate & Discuss
                </CardTitle>
                <CardDescription>
                  Add explanations to lyrics, share interpretations, and discuss meanings with the community
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Contribute & Share
                </CardTitle>
                <CardDescription>
                  Submit new lyrics, help improve existing ones, and build the world's best lyrics database
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-6">
            Platform Statistics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">Growing</div>
              <div className="text-sm text-muted-foreground">Songs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Community</div>
              <div className="text-sm text-muted-foreground">Annotations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Active</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Engaged</div>
              <div className="text-sm text-muted-foreground">Community</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}