'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, Music, User, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SongWithUser } from '@/features/songs/config/song.types';
import { useSongsSearch } from '@/features/songs/hooks/use-songs';
import Link from 'next/link';

interface SearchPageContentProps {
  searchParams: { q?: string; artist?: string; genre?: string; page?: string };
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
  const [showFilters, setShowFilters] = useState(false);

  const { data: searchResults, isLoading, error } = useSongsSearch({
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
    params.set('page', '1'); // Reset to first page on new search
    
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setArtist('');
    setGenre('');
    router.push('/search');
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (artist) params.set('artist', artist);
    if (genre) params.set('genre', genre);
    params.set('page', newPage.toString());
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="space-y-6 mb-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Search Songs</h1>
            <p className="text-muted-foreground">Find lyrics, artists, and discover new music</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search songs, artists, or lyrics..."
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

        {/* Results */}
        <div className="space-y-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Searching...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-destructive">Error loading search results. Please try again.</p>
            </div>
          )}

          {searchResults && (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {searchResults.pagination.total} songs found
                </h2>
                <p className="text-sm text-muted-foreground">
                  Page {searchResults.pagination.page} of {searchResults.pagination.totalPages}
                </p>
              </div>

              {/* Results Grid */}
              {searchResults.data.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No songs found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.data.map((song) => (
                    <SongCard key={song.id} song={song} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {searchResults.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={!searchResults.pagination.hasPrev}
                    onClick={() => handlePageChange(searchResults.pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 py-2 text-sm">
                    {searchResults.pagination.page} of {searchResults.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={!searchResults.pagination.hasNext}
                    onClick={() => handlePageChange(searchResults.pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SongCard({ song }: { song: SongWithUser }) {
  return (
    <Link href={`/songs/${song.slug}`} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-1">{song.title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{song.artist}</span>
          </div>
          {song.album && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{song.album}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {song.genre && (
              <Badge variant="secondary" className="text-xs">
                {song.genre.charAt(0).toUpperCase() + song.genre.slice(1)}
              </Badge>
            )}
            
            <p className="text-sm text-muted-foreground line-clamp-3">
              {song.lyrics.substring(0, 120)}...
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{song.views.toLocaleString()} views</span>
              <span>{song.likes.toLocaleString()} likes</span>
              <span>{song.commentsCount} comments</span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              by {song.submittedByUser.name}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}