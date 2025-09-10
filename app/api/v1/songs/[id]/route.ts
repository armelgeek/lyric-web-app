import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SongService } from '@/features/songs/domain/service';
import { updateSongSchema } from '@/features/songs/config/song.schema';

const songService = new SongService();

// GET /api/v1/songs/[id] - Get song by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    const song = await songService.getSongById(id, userId);

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
    console.error('Error in GET /api/v1/songs/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get song',
      },
      { status: 500 }
    );
  }
}

// PUT /api/v1/songs/[id] - Update song
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateSongSchema.parse(body);
    
    const song = await songService.updateSong(id, validatedData, session.user.id);

    if (!song) {
      return NextResponse.json(
        { success: false, message: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: song,
      message: 'Song updated successfully',
    });
  } catch (error) {
    console.error('Error in PUT /api/v1/songs/[id]:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to edit this song' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update song',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/songs/[id] - Delete song
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const success = await songService.deleteSong(id, session.user.id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Song deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/v1/songs/[id]:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to delete this song' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete song',
      },
      { status: 500 }
    );
  }
}