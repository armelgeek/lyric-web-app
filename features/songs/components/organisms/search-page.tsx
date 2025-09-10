'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Music, User, Disc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSongsSearch } from '@/features/songs/hooks/use-songs';
import { SimpleSongList } from '../molecules/simple-song-list';
import Link from 'next/link';

interface SearchPageContentProps {
  searchParams: { q?: string; artist?: string; genre?: string; page?: string; type?: string };
}

const genres = [
  'pop', 'rock', 'hip-hop', 'r&b', 'country', 'jazz', 'blues', 'electronic',
  'folk', 'classical', 'reggae', 'punk', 'metal', 'indie', 'alternative', 'other'
];

export default function SearchPageContent({ searchParams }: SearchPageContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.q || '');
  const [artist, setArtist] = useState(searchParams.artist || '');
  const [genre, setGenre] = useState(searchParams.genre || '');
  const [searchType, setSearchType] = useState(searchParams.type || 'songs');
  const [showFilters, setShowFilters] = useState(false);

  const { data: songResults, isLoading, error } = useSongsSearch({
    query: searchQuery || undefined,
    artist: artist || undefined,
    genre: (genre as any) || undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: parseInt(searchParams.page || '1'),
    limit: 20
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (artist) params.set('artist', artist);
    if (genre) params.set('genre', genre);
    if (searchType !== 'songs') params.set('type', searchType);
    params.set('page', '1');
    
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setArtist('');
    setGenre('');
    setSearchType('songs');
    router.push('/search');
  };

  const transformSongs = () => {
    if (!songResults?.data) return [];
    return songResults.data.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album || undefined,
      genre: song.genre || undefined,
      views: song.views,
      likes: song.likes,
      annotationsCount: song.annotationsCount,
      slug: song.slug,
      spotifyUrl: song.spotifyUrl || undefined,
      youtubeUrl: song.youtubeUrl || undefined,
      appleMusicUrl: song.appleMusicUrl || undefined,
      createdAt: song.createdAt.toISOString(),
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="space-y-6 mb-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Search</h1>
            <p className="text-muted-foreground">Find songs, artists, albums, and discover new music</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search songs, artists, albums, or lyrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>
                Search
              </Button>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Artist</label>
                      <Input
                        placeholder="Filter by artist"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Genre</label>
                      <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Genres</SelectItem>
                          {genres.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSearch}>Apply Filters</Button>
                    <Button variant="outline" onClick={clearFilters}>Clear All</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Search Results */}
        <Tabs value={searchType} onValueChange={setSearchType} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="songs" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Songs
            </TabsTrigger>
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Artists
            </TabsTrigger>
            <TabsTrigger value="albums" className="flex items-center gap-2">
              <Disc className="w-4 h-4" />
              Albums
            </TabsTrigger>
          </TabsList>

          {/* Songs Tab */}
          <TabsContent value="songs" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Searching songs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">Error loading songs. Please try again.</p>
              </div>
            ) : songResults ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {songResults.pagination.total} songs found
                  </h2>
                </div>

                <SimpleSongList 
                  songs={transformSongs()} 
                  emptyMessage="No songs found matching your search."
                />
              </>
            ) : (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Search for songs</h3>
                <p className="text-muted-foreground">Enter a search term to find songs, lyrics, or artists</p>
              </div>
            )}
          </TabsContent>

          {/* Artists Tab */}
          <TabsContent value="artists" className="space-y-6">
            <div className="text-center py-12">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Artist search coming soon</h3>
              <p className="text-muted-foreground">
                <Link href="/artists" className="text-primary hover:underline">
                  Browse all artists
                </Link>
              </p>
            </div>
          </TabsContent>

          {/* Albums Tab */}
          <TabsContent value="albums" className="space-y-6">
            <div className="text-center py-12">
              <Disc className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Album search coming soon</h3>
              <p className="text-muted-foreground">
                <Link href="/albums" className="text-primary hover:underline">
                  Browse all albums
                </Link>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}