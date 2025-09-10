import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { songs } from '@/drizzle/schema/lyrics';
import { sql } from 'drizzle-orm';
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
  spotifyUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get album name and artist from slug
    const [albumPart, artistPart] = slug.split('-by-');
    const albumName = albumPart.replace(/-/g, ' ');
    const artistName = artistPart?.replace(/-/g, ' ');
    
    if (!artistName) {
      return NextResponse.json(
        { error: 'Invalid album slug format. Expected: album-name-by-artist-name' },
        { status: 400 }
      );
    }

    // Get album stats from songs
    const albumStats = await db
      .select({
        title: songs.album,
        artist: songs.artist,
        totalTracks: sql<number>`count(*)::int`,
        totalViews: sql<number>`sum(${songs.views})::int`,
        genre: sql<string>`(array_agg(${songs.genre}) filter (where ${songs.genre} is not null))[1]`,
        releaseDate: sql<string>`min(${songs.releaseDate})::text`,
        spotifyUrl: sql<string>`(array_agg(${songs.spotifyUrl}) filter (where ${songs.spotifyUrl} is not null))[1]`,
        youtubeUrl: sql<string>`(array_agg(${songs.youtubeUrl}) filter (where ${songs.youtubeUrl} is not null))[1]`,
        appleMusicUrl: sql<string>`(array_agg(${songs.appleMusicUrl}) filter (where ${songs.appleMusicUrl} is not null))[1]`,
      })
      .from(songs)
      .where(
        sql`lower(${songs.album}) = ${albumName.toLowerCase()} AND lower(${songs.artist}) = ${artistName.toLowerCase()}`
      )
      .groupBy(songs.album, songs.artist)
      .limit(1);

    if (!albumStats.length) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    const stats = albumStats[0];
    
    // Create album object
    const album: Album = {
      title: albumName,
      artist: artistName,
      artistSlug: slugify(artistName, { lower: true, strict: true }),
      slug: slug,
      releaseDate: stats.releaseDate,
      genre: stats.genre,
      totalTracks: stats.totalTracks,
      totalViews: stats.totalViews || 0,
      spotifyUrl: stats.spotifyUrl,
      youtubeUrl: stats.youtubeUrl,
      appleMusicUrl: stats.appleMusicUrl,
    };

    return NextResponse.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}