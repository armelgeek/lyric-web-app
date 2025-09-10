import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { songs } from '@/drizzle/schema/lyrics';
import { count, sql, eq } from 'drizzle-orm';

interface Artist {
  name: string;
  slug: string;
  bio?: string;
  isVerified: boolean;
  totalSongs: number;
  totalViews: number;
  followers: number;
  spotifyUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
  genres: string[];
  debutYear?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get artist name from slug
    const artistName = slug.replace(/-/g, ' ');
    
    // Get artist stats from songs
    const artistStats = await db
      .select({
        totalSongs: count(),
        totalViews: sql<number>`sum(${songs.views})::int`,
        genres: sql<string[]>`array_agg(distinct ${songs.genre}) filter (where ${songs.genre} is not null)`,
        spotifyUrl: sql<string>`(array_agg(${songs.spotifyUrl}) filter (where ${songs.spotifyUrl} is not null))[1]`,
        youtubeUrl: sql<string>`(array_agg(${songs.youtubeUrl}) filter (where ${songs.youtubeUrl} is not null))[1]`,
        appleMusicUrl: sql<string>`(array_agg(${songs.appleMusicUrl}) filter (where ${songs.appleMusicUrl} is not null))[1]`,
        debutYear: sql<number>`extract(year from min(${songs.releaseDate}))::int`,
      })
      .from(songs)
      .where(eq(sql`lower(${songs.artist})`, artistName.toLowerCase()))
      .groupBy()
      .limit(1);

    if (!artistStats.length) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    const stats = artistStats[0];
    
    // Create artist object
    const artist: Artist = {
      name: artistName,
      slug: slug,
      bio: undefined, // TODO: Add bio from artist table when created
      isVerified: false, // TODO: Check from artist table when created
      totalSongs: stats.totalSongs,
      totalViews: stats.totalViews || 0,
      followers: 0, // TODO: Count from user_follows when artist profiles exist
      spotifyUrl: stats.spotifyUrl,
      youtubeUrl: stats.youtubeUrl,
      appleMusicUrl: stats.appleMusicUrl,
      genres: stats.genres || [],
      debutYear: stats.debutYear,
    };

    return NextResponse.json(artist);
  } catch (error) {
    console.error('Error fetching artist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}