import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SongService } from '@/features/songs/domain/service';

const songService = new SongService();

// GET /api/v1/songs/slug/[slug] - Get song by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    const song = await songService.getSongBySlug(slug, userId);

    if (!song) {
      return NextResponse.json(
        { success: false, message: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: song,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/songs/slug/[slug]:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get song',
      },
      { status: 500 }
    );
  }
}