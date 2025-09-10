import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { songs } from '@/drizzle/schema/lyrics';
import { sql, asc } from 'drizzle-orm';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  trackNumber?: number;
  duration?: string;
  views: number;
  likes: number;
  annotationsCount: number;
  slug: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
  createdAt: string;
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

    // Fetch album tracks
    const albumTracks = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        album: songs.album,
        views: songs.views,
        likes: songs.likes,
        annotationsCount: songs.annotationsCount,
        slug: songs.slug,
        spotifyUrl: songs.spotifyUrl,
        youtubeUrl: songs.youtubeUrl,
        appleMusicUrl: songs.appleMusicUrl,
        createdAt: songs.createdAt,
      })
      .from(songs)
      .where(
        sql`lower(${songs.album}) = ${albumName.toLowerCase()} AND lower(${songs.artist}) = ${artistName.toLowerCase()}`
      )
      .orderBy(asc(songs.title)); // Order by title since we don't have track numbers yet

    // Transform to include track numbers (based on order for now)
    const tracks: Song[] = albumTracks.map((track, index) => ({
      ...track,
      album: track.album || undefined,
      trackNumber: index + 1,
      duration: undefined, // TODO: Add duration field to songs table
      spotifyUrl: track.spotifyUrl || undefined,
      youtubeUrl: track.youtubeUrl || undefined,
      appleMusicUrl: track.appleMusicUrl || undefined,
      createdAt: track.createdAt.toISOString(),
    }));

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching album tracks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}