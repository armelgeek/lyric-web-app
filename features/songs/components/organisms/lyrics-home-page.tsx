'use client';

import { Search, Plus, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { SongList } from '@/features/songs/components/organisms/song-list';
import { useTrendingSongs } from '@/features/songs/hooks/use-trending-songs';
import { useState } from 'react';

export function LyricsHomePage() {
  const { songs: trendingSongs, loading, error } = useTrendingSongs(12);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
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
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search songs, artists, or lyrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background text-foreground"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
            
            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <Link href="/songs/submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Lyrics
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/explore">
                  Explore All Songs
                </Link>
              </Button>
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
            <Button asChild variant="outline">
              <Link href="/trending">View All</Link>
            </Button>
          </div>
          
          {loading ? (
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
                      <div className="h-3 bg-muted rounded w-4/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  Error loading trending songs: {error}
                </p>
              </CardContent>
            </Card>
          ) : (
            <SongList 
              songs={trendingSongs} 
              emptyMessage="No trending songs yet. Be the first to submit some lyrics!"
            />
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
      </div>
    </div>
  );
}