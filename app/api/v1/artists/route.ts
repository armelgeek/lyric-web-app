import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { songs } from '@/drizzle/schema/lyrics';
import { count, sql } from 'drizzle-orm';
import slugify from 'slugify';

interface Artist {
  name: string;
  slug: string;
  totalSongs: number;
  totalViews: number;
  followers: number;
  genres: string[];
  isVerified: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Get all artists with their stats
    const baseQuery = db
      .select({
        artist: songs.artist,
        totalSongs: count(),
        totalViews: sql<number>`sum(${songs.views})::int`,
        genres: sql<string[]>`array_agg(distinct ${songs.genre}) filter (where ${songs.genre} is not null)`,
      })
      .from(songs)
      .groupBy(songs.artist);
    
    const artistsData = await baseQuery;
    
    // Filter and sort in JavaScript for now
    let filteredArtists = artistsData;
    
    if (search) {
      filteredArtists = artistsData.filter((artist) => 
        artist.artist.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort artists
    filteredArtists.sort((a, b) => {
      switch (sortBy) {
        case 'songs':
          return b.totalSongs - a.totalSongs;
        case 'views':
          return (b.totalViews || 0) - (a.totalViews || 0);
        case 'name':
        default:
          return a.artist.localeCompare(b.artist);
      }
    });
    
    // Apply pagination
    const paginatedArtists = filteredArtists.slice(offset, offset + limit);
    
    // Transform data to Artist interface
    const artists: Artist[] = paginatedArtists.map((data) => ({
      name: data.artist,
      slug: slugify(data.artist, { lower: true, strict: true }),
      totalSongs: data.totalSongs,
      totalViews: data.totalViews || 0,
      followers: 0, // TODO: Implement when user follows artists
      genres: data.genres || [],
      isVerified: false, // TODO: Implement when artist verification exists
    }));

    return NextResponse.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}