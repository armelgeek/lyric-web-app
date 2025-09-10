import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { songs } from '@/drizzle/schema/lyrics';
import { count, sql, isNotNull } from 'drizzle-orm';
import slugify from 'slugify';

interface Album {
  title: string;
  artist: string;
  artistSlug: string;
  slug: string;
  releaseDate?: string;
  genre?: string;
  totalTracks: number;
  totalViews: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'title';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Get all albums with their stats (only songs that have albums)
    const baseQuery = db
      .select({
        album: songs.album,
        artist: songs.artist,
        totalTracks: count(),
        totalViews: sql<number>`sum(${songs.views})::int`,
        genre: sql<string>`(array_agg(${songs.genre}) filter (where ${songs.genre} is not null))[1]`,
        releaseDate: sql<string>`min(${songs.releaseDate})::text`,
      })
      .from(songs)
      .where(isNotNull(songs.album))
      .groupBy(songs.album, songs.artist);
    
    const albumsData = await baseQuery;
    
    // Filter and sort in JavaScript for now
    let filteredAlbums = albumsData;
    
    if (search) {
      filteredAlbums = albumsData.filter((album) => 
        album.album?.toLowerCase().includes(search.toLowerCase()) ||
        album.artist.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort albums
    filteredAlbums.sort((a, b) => {
      switch (sortBy) {
        case 'tracks':
          return b.totalTracks - a.totalTracks;
        case 'views':
          return (b.totalViews || 0) - (a.totalViews || 0);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'release_date':
          return new Date(b.releaseDate || '').getTime() - new Date(a.releaseDate || '').getTime();
        case 'title':
        default:
          return (a.album || '').localeCompare(b.album || '');
      }
    });
    
    // Apply pagination
    const paginatedAlbums = filteredAlbums.slice(offset, offset + limit);
    
    // Transform data to Album interface
    const albums: Album[] = paginatedAlbums
      .filter((data) => data.album) // Ensure album is not null
      .map((data) => {
        const albumSlug = `${slugify(data.album!, { lower: true, strict: true })}-by-${slugify(data.artist, { lower: true, strict: true })}`;
        
        return {
          title: data.album!,
          artist: data.artist,
          artistSlug: slugify(data.artist, { lower: true, strict: true }),
          slug: albumSlug,
          releaseDate: data.releaseDate || undefined,
          genre: data.genre || undefined,
          totalTracks: data.totalTracks,
          totalViews: data.totalViews || 0,
        };
      });

    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}