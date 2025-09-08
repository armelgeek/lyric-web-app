import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSongUseCase } from '@/features/songs/domain/use-cases/create-song.use-case';
import { searchSongsUseCase } from '@/features/songs/domain/use-cases/search-songs.use-case';
import { createSongSchema, searchSongsSchema } from '@/features/songs/config/song.schema';

// GET /api/v1/songs - Search songs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      query: searchParams.get('query') || undefined,
      artist: searchParams.get('artist') || undefined,
      genre: searchParams.get('genre') || undefined,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    const validatedParams = searchSongsSchema.parse(queryParams);
    const result = await searchSongsUseCase(validatedParams);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/songs:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to search songs',
      },
      { status: 500 }
    );
  }
}

// POST /api/v1/songs - Create new song
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createSongSchema.parse(body);
    
    const song = await createSongUseCase(validatedData, session.user.id);

    return NextResponse.json({
      success: true,
      data: song,
      message: 'Song created successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/v1/songs:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, message: 'Invalid input data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create song',
      },
      { status: 500 }
    );
  }
}