import { NextRequest, NextResponse } from 'next/server';
import { getTrendingSongsUseCase } from '@/features/songs/domain/use-cases/search-songs.use-case';

// GET /api/v1/songs/trending - Get trending songs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const trendingSongs = await getTrendingSongsUseCase(limit);

    return NextResponse.json({
      success: true,
      data: trendingSongs,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/songs/trending:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get trending songs',
      },
      { status: 500 }
    );
  }
}