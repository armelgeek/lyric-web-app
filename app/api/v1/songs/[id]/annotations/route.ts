import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AnnotationService } from '@/features/songs/domain/annotation-service';
import { createAnnotationSchema } from '@/features/songs/config/song.schema';

const annotationService = new AnnotationService();

// POST /api/v1/songs/[id]/annotations - Create annotation
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

    const body = await request.json();
    const validatedData = createAnnotationSchema.parse({
      ...body,
      songId: id,
    });
    
    const annotation = await annotationService.createAnnotation(validatedData, session.user.id);

    return NextResponse.json({
      success: true,
      data: annotation,
      message: 'Annotation created successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/v1/songs/[id]/annotations:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, message: 'Invalid annotation data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create annotation',
      },
      { status: 500 }
    );
  }
}

// GET /api/v1/songs/[id]/annotations - Get song annotations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    const annotations = await annotationService.getSongAnnotations(id, userId);

    return NextResponse.json({
      success: true,
      data: annotations,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/songs/[id]/annotations:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get annotations',
      },
      { status: 500 }
    );
  }
}