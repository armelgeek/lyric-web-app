import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { songs } from '@/drizzle/schema/lyrics';
import { desc, asc, sql, eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const sortBy = searchParams.get('sortBy') || 'views';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Get artist name from slug
    const artistName = slug.replace(/-/g, ' ');
    
    // Build sort order
    const sortColumn = {
      views: songs.views,
      likes: songs.likes,
      title: songs.title,
      created_at: songs.createdAt,
    }[sortBy] || songs.views;
    
    const orderFn = sortOrder === 'asc' ? asc : desc;
    
    // Fetch artist's songs
    const artistSongs = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        album: songs.album,
        releaseDate: songs.releaseDate,
        genre: songs.genre,
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
        eq(sql`lower(${songs.artist})`, artistName.toLowerCase())
      )
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(artistSongs);
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}