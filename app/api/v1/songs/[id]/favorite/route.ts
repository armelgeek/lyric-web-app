import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SongService } from '@/features/songs/domain/service';

const songService = new SongService();

// POST /api/v1/songs/[id]/favorite - Toggle favorite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await songService.toggleFavorite(id, session.user.id);

    return NextResponse.json({
      success: true,
      data: result,
      message: result.favorited ? 'Song added to favorites' : 'Song removed from favorites',
    });
  } catch (error) {
    console.error('Error in POST /api/v1/songs/[id]/favorite:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to toggle favorite',
      },
      { status: 500 }
    );
  }
}