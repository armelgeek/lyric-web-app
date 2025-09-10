import { db } from '@/drizzle/db';
import { eq, and, desc, count } from 'drizzle-orm';
import { 
  annotations, 
  annotationVotes, 
  songs, 
  users 
} from '@/drizzle/schema';
import { 
  CreateAnnotationPayload, 
  Annotation, 
  AnnotationWithUser 
} from '../config/song.types';

export class AnnotationService {
  // Create new annotation
  async createAnnotation(data: CreateAnnotationPayload, userId: string): Promise<Annotation> {
    // Verify song exists
    const [song] = await db
      .select({ id: songs.id })
      .from(songs)
      .where(eq(songs.id, data.songId));

    if (!song) {
      throw new Error('Song not found');
    }

    // Create annotation
    const [annotation] = await db
      .insert(annotations)
      .values({
        ...data,
        userId,
      })
      .returning();

    // Update song annotation count
    const [annotationCount] = await db
      .select({ count: count() })
      .from(annotations)
      .where(eq(annotations.songId, data.songId));

    await db
      .update(songs)
      .set({
        annotationsCount: annotationCount.count
      })
      .where(eq(songs.id, data.songId));

    return annotation;
  }

  // Get annotations for a song
  async getSongAnnotations(songId: string, userId?: string): Promise<AnnotationWithUser[]> {
    const songAnnotations = await db
      .select({
        id: annotations.id,
        songId: annotations.songId,
        userId: annotations.userId,
        highlightedText: annotations.highlightedText,
        startPosition: annotations.startPosition,
        endPosition: annotations.endPosition,
        explanation: annotations.explanation,
        upvotes: annotations.upvotes,
        downvotes: annotations.downvotes,
        commentsCount: annotations.commentsCount,
        isApproved: annotations.isApproved,
        approvedBy: annotations.approvedBy,
        approvedAt: annotations.approvedAt,
        createdAt: annotations.createdAt,
        updatedAt: annotations.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
        song: {
          id: songs.id,
          title: songs.title,
          artist: songs.artist,
        },
      })
      .from(annotations)
      .leftJoin(users, eq(annotations.userId, users.id))
      .leftJoin(songs, eq(annotations.songId, songs.id))
      .where(and(
        eq(annotations.songId, songId),
        eq(annotations.isApproved, true)
      ))
      .orderBy(desc(annotations.createdAt));

    // Get user's votes if logged in
    let userVotes: Record<string, boolean> = {};
    if (userId) {
      const votes = await db
        .select({
          annotationId: annotationVotes.annotationId,
          isUpvote: annotationVotes.isUpvote,
        })
        .from(annotationVotes)
        .where(eq(annotationVotes.userId, userId));

      userVotes = votes.reduce((acc, vote) => {
        acc[vote.annotationId] = vote.isUpvote;
        return acc;
      }, {} as Record<string, boolean>);
    }

    return songAnnotations
      .filter(annotation => annotation.user !== null && annotation.song !== null)
      .map(annotation => ({
        ...annotation,
        user: {
          id: annotation.user!.id,
          name: annotation.user!.name,
          image: annotation.user!.image || undefined,
        },
        song: {
          id: annotation.song!.id,
          title: annotation.song!.title,
          artist: annotation.song!.artist,
        },
        isUpvotedByUser: userId ? userVotes[annotation.id] === true : undefined,
        isDownvotedByUser: userId ? userVotes[annotation.id] === false : undefined,
      }));
  }

  // Vote on annotation
  async voteAnnotation(annotationId: string, userId: string, isUpvote: boolean): Promise<void> {
    // Check if user already voted
    const [existingVote] = await db
      .select()
      .from(annotationVotes)
      .where(and(
        eq(annotationVotes.annotationId, annotationId),
        eq(annotationVotes.userId, userId)
      ));

    if (existingVote) {
      if (existingVote.isUpvote === isUpvote) {
        // Remove vote if same vote
        await db
          .delete(annotationVotes)
          .where(and(
            eq(annotationVotes.annotationId, annotationId),
            eq(annotationVotes.userId, userId)
          ));
      } else {
        // Update vote if different
        await db
          .update(annotationVotes)
          .set({ isUpvote })
          .where(and(
            eq(annotationVotes.annotationId, annotationId),
            eq(annotationVotes.userId, userId)
          ));
      }
    } else {
      // Create new vote
      await db
        .insert(annotationVotes)
        .values({
          annotationId,
          userId,
          isUpvote,
        });
    }

    // Update annotation vote counts
    const [upvoteCount] = await db
      .select({ count: count() })
      .from(annotationVotes)
      .where(and(
        eq(annotationVotes.annotationId, annotationId),
        eq(annotationVotes.isUpvote, true)
      ));

    const [downvoteCount] = await db
      .select({ count: count() })
      .from(annotationVotes)
      .where(and(
        eq(annotationVotes.annotationId, annotationId),
        eq(annotationVotes.isUpvote, false)
      ));

    await db
      .update(annotations)
      .set({
        upvotes: upvoteCount.count,
        downvotes: downvoteCount.count,
      })
      .where(eq(annotations.id, annotationId));
  }

  // Delete annotation (only by owner or admin)
  async deleteAnnotation(annotationId: string, userId: string): Promise<boolean> {
    const [annotation] = await db
      .select({
        userId: annotations.userId,
        songId: annotations.songId,
      })
      .from(annotations)
      .where(eq(annotations.id, annotationId));

    if (!annotation) {
      return false;
    }

    // Check if user owns the annotation (or is admin - would need role check)
    if (annotation.userId !== userId) {
      throw new Error('Unauthorized to delete this annotation');
    }

    await db
      .delete(annotations)
      .where(eq(annotations.id, annotationId));

    // Update song annotation count
    const [annotationCount] = await db
      .select({ count: count() })
      .from(annotations)
      .where(eq(annotations.songId, annotation.songId));

    await db
      .update(songs)
      .set({
        annotationsCount: annotationCount.count
      })
      .where(eq(songs.id, annotation.songId));

    return true;
  }
}