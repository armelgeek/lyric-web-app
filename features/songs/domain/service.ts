import { db } from '@/drizzle/db';
import { 
  songs, 
  annotations, 
  comments, 
  likes, 
  userFavorites, 
  userProfiles,
  users 
} from '@/drizzle/schema';
import { eq, and, or, like, desc, asc, count, sql } from 'drizzle-orm';
import { 
  Song, 
  SongWithUser, 
  SongWithDetails, 
  CreateSongPayload, 
  UpdateSongPayload,
  SearchSongsPayload,
  PaginatedResponse 
} from '../config/song.types';
import slugify from 'slugify';
import { AnnotationService } from './annotation-service';

export class SongService {
  // Create a new song
  async createSong(data: CreateSongPayload, userId: string): Promise<Song> {
    const slug = this.generateSlug(data.title, data.artist);
    
    const [song] = await db.insert(songs).values({
      ...data,
      submittedBy: userId,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Update user stats
    await this.updateUserStats(userId, 'lyrics_submitted', 1);

    return song;
  }

  // Get song by ID
  async getSongById(id: string, userId?: string): Promise<SongWithDetails | null> {
    const [song] = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        album: songs.album,
        releaseDate: songs.releaseDate,
        genre: songs.genre,
        lyrics: songs.lyrics,
        submittedBy: songs.submittedBy,
        views: songs.views,
        likes: songs.likes,
        annotationsCount: songs.annotationsCount,
        commentsCount: songs.commentsCount,
        isApproved: songs.isApproved,
        approvedBy: songs.approvedBy,
        approvedAt: songs.approvedAt,
        slug: songs.slug,
        spotifyUrl: songs.spotifyUrl,
        youtubeUrl: songs.youtubeUrl,
        appleMusicUrl: songs.appleMusicUrl,
        createdAt: songs.createdAt,
        updatedAt: songs.updatedAt,
        submittedByUser: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(songs)
      .leftJoin(users, eq(songs.submittedBy, users.id))
      .where(eq(songs.id, id));

    if (!song) return null;

    // Get annotations for this song (basic)
    const basicAnnotations = await db
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
      })
      .from(annotations)
      .where(and(eq(annotations.songId, id), eq(annotations.isApproved, true)))
      .orderBy(desc(annotations.upvotes));

    // Get comments for this song
    const songComments = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        songId: comments.songId,
        annotationId: comments.annotationId,
        parentId: comments.parentId,
        content: comments.content,
        likes: comments.likes,
        isApproved: comments.isApproved,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
      })
      .from(comments)
      .where(and(eq(comments.songId, id), eq(comments.isApproved, true)))
      .orderBy(desc(comments.createdAt));

    // Check if user has liked/favorited this song
    let isLikedByUser = false;
    let isFavoriteByUser = false;

    if (userId) {
      const [like] = await db
        .select()
        .from(likes)
        .where(and(eq(likes.userId, userId), eq(likes.songId, id)))
        .limit(1);

      const [favorite] = await db
        .select()
        .from(userFavorites)
        .where(and(eq(userFavorites.userId, userId), eq(userFavorites.songId, id)))
        .limit(1);

      isLikedByUser = !!like;
      isFavoriteByUser = !!favorite;

      // Increment view count
      await this.incrementViews(id);
    }

    if (!song || !song.submittedByUser) return null;

    // Use annotation service to get full annotations with user data
    const annotationService = new AnnotationService();
    const fullAnnotations = await annotationService.getSongAnnotations(id, userId);

    return {
      ...song,
      submittedByUser: {
        id: song.submittedByUser.id,
        name: song.submittedByUser.name,
        image: song.submittedByUser.image || undefined,
      },
      annotations: fullAnnotations,
      comments: songComments,
      isLikedByUser,
      isFavoriteByUser,
    };
  }

  // Get song by slug
  async getSongBySlug(slug: string, userId?: string): Promise<SongWithDetails | null> {
    const [song] = await db
      .select()
      .from(songs)
      .where(eq(songs.slug, slug))
      .limit(1);

    if (!song) return null;

    return this.getSongById(song.id, userId);
  }

  // Search songs
  async searchSongs(filters: SearchSongsPayload): Promise<PaginatedResponse<SongWithUser>> {
    const { query, artist, genre, sortBy, sortOrder, page, limit } = filters;
    const offset = (page - 1) * limit;

    const conditions = [eq(songs.isApproved, true)];

    if (query) {
      const searchCondition = or(
        like(songs.title, `%${query}%`),
        like(songs.artist, `%${query}%`),
        like(songs.lyrics, `%${query}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (artist) {
      conditions.push(like(songs.artist, `%${artist}%`));
    }

    if (genre) {
      conditions.push(eq(songs.genre, genre));
    }

    const whereConditions = and(...conditions);

    // Determine sort order - handle sortBy more safely
    let orderByClause;
    switch (sortBy) {
      case 'views':
        orderByClause = sortOrder === 'asc' ? asc(songs.views) : desc(songs.views);
        break;
      case 'likes':
        orderByClause = sortOrder === 'asc' ? asc(songs.likes) : desc(songs.likes);
        break;
      case 'title':
        orderByClause = sortOrder === 'asc' ? asc(songs.title) : desc(songs.title);
        break;
      case 'artist':
        orderByClause = sortOrder === 'asc' ? asc(songs.artist) : desc(songs.artist);
        break;
      default:
        orderByClause = sortOrder === 'asc' ? asc(songs.createdAt) : desc(songs.createdAt);
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(songs)
      .where(whereConditions);

    // Get songs with user info
    const songsData = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        album: songs.album,
        releaseDate: songs.releaseDate,
        genre: songs.genre,
        lyrics: songs.lyrics,
        submittedBy: songs.submittedBy,
        views: songs.views,
        likes: songs.likes,
        annotationsCount: songs.annotationsCount,
        commentsCount: songs.commentsCount,
        isApproved: songs.isApproved,
        approvedBy: songs.approvedBy,
        approvedAt: songs.approvedAt,
        slug: songs.slug,
        spotifyUrl: songs.spotifyUrl,
        youtubeUrl: songs.youtubeUrl,
        appleMusicUrl: songs.appleMusicUrl,
        createdAt: songs.createdAt,
        updatedAt: songs.updatedAt,
        submittedByUser: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(songs)
      .leftJoin(users, eq(songs.submittedBy, users.id))
      .where(whereConditions)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(total / limit);

    // Transform data to handle null-to-undefined conversion
    const transformedData: SongWithUser[] = songsData
      .filter(song => song.submittedByUser !== null)
      .map(song => ({
        ...song,
        submittedByUser: {
          id: song.submittedByUser!.id,
          name: song.submittedByUser!.name,
          image: song.submittedByUser!.image || undefined,
        },
      }));

    return {
      data: transformedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Update song
  async updateSong(id: string, data: UpdateSongPayload, userId: string): Promise<Song | null> {
    // Check if user owns this song or is moderator/admin
    const [song] = await db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);

    if (!song) return null;

    const [userProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    const canEdit = song.submittedBy === userId || 
                   userProfile?.role === 'moderator' || 
                   userProfile?.role === 'admin';

    if (!canEdit) {
      throw new Error('Unauthorized to edit this song');
    }

    const [updatedSong] = await db
      .update(songs)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(songs.id, id))
      .returning();

    return updatedSong;
  }

  // Delete song
  async deleteSong(id: string, userId: string): Promise<boolean> {
    const [song] = await db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);

    if (!song) return false;

    const [userProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    const canDelete = song.submittedBy === userId || 
                     userProfile?.role === 'moderator' || 
                     userProfile?.role === 'admin';

    if (!canDelete) {
      throw new Error('Unauthorized to delete this song');
    }

    await db.delete(songs).where(eq(songs.id, id));
    return true;
  }

  // Like/unlike song
  async toggleSongLike(songId: string, userId: string): Promise<boolean> {
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.songId, songId)))
      .limit(1);

    if (existingLike) {
      // Unlike
      await db.delete(likes).where(eq(likes.id, existingLike.id));
      await this.updateSongStats(songId, 'likes', -1);
      return false;
    } else {
      // Like
      await db.insert(likes).values({
        userId,
        songId,
        createdAt: new Date(),
      });
      await this.updateSongStats(songId, 'likes', 1);
      return true;
    }
  }

  // Add/remove song from favorites
  async toggleSongFavorite(songId: string, userId: string): Promise<boolean> {
    const [existingFavorite] = await db
      .select()
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.songId, songId)))
      .limit(1);

    if (existingFavorite) {
      // Remove from favorites
      await db.delete(userFavorites).where(eq(userFavorites.id, existingFavorite.id));
      return false;
    } else {
      // Add to favorites
      await db.insert(userFavorites).values({
        userId,
        songId,
        createdAt: new Date(),
      });
      return true;
    }
  }

  // Get trending songs
  async getTrendingSongs(limit: number = 10): Promise<SongWithUser[]> {
    const songsData = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        album: songs.album,
        releaseDate: songs.releaseDate,
        genre: songs.genre,
        lyrics: songs.lyrics,
        submittedBy: songs.submittedBy,
        views: songs.views,
        likes: songs.likes,
        annotationsCount: songs.annotationsCount,
        commentsCount: songs.commentsCount,
        isApproved: songs.isApproved,
        approvedBy: songs.approvedBy,
        approvedAt: songs.approvedAt,
        slug: songs.slug,
        spotifyUrl: songs.spotifyUrl,
        youtubeUrl: songs.youtubeUrl,
        appleMusicUrl: songs.appleMusicUrl,
        createdAt: songs.createdAt,
        updatedAt: songs.updatedAt,
        submittedByUser: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(songs)
      .leftJoin(users, eq(songs.submittedBy, users.id))
      .where(eq(songs.isApproved, true))
      .orderBy(desc(sql`${songs.views} + ${songs.likes} * 2 + ${songs.annotationsCount} * 3`))
      .limit(limit);

    // Transform data to handle null-to-undefined conversion
    return songsData
      .filter(song => song.submittedByUser !== null)
      .map(song => ({
        ...song,
        submittedByUser: {
          id: song.submittedByUser!.id,
          name: song.submittedByUser!.name,
          image: song.submittedByUser!.image || undefined,
        },
      }));
  }

  // Helper methods
  private generateSlug(title: string, artist: string): string {
    const baseSlug = slugify(`${artist} ${title}`, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g 
    });
    
    // Add timestamp to ensure uniqueness
    return `${baseSlug}-${Date.now()}`;
  }

  private async incrementViews(songId: string): Promise<void> {
    await db
      .update(songs)
      .set({
        views: sql`${songs.views} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(songs.id, songId));
  }

  private async updateSongStats(songId: string, field: 'likes' | 'annotations_count' | 'comments_count', increment: number): Promise<void> {
    const column = field === 'likes' ? songs.likes : 
                  field === 'annotations_count' ? songs.annotationsCount : songs.commentsCount;
    
    await db
      .update(songs)
      .set({
        [field]: sql`${column} + ${increment}`,
        updatedAt: new Date(),
      })
      .where(eq(songs.id, songId));
  }

  // Toggle like on song
  async toggleLike(songId: string, userId: string): Promise<{ liked: boolean; totalLikes: number }> {
    // Check if user already liked this song
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(and(
        eq(likes.songId, songId),
        eq(likes.userId, userId)
      ));

    if (existingLike) {
      // Remove like
      await db
        .delete(likes)
        .where(and(
          eq(likes.songId, songId),
          eq(likes.userId, userId)
        ));
      
      // Decrement song likes count
      await db
        .update(songs)
        .set({
          likes: sql`${songs.likes} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(songs.id, songId));

      // Get updated count
      const [song] = await db
        .select({ likes: songs.likes })
        .from(songs)
        .where(eq(songs.id, songId));

      return { liked: false, totalLikes: song.likes };
    } else {
      // Add like
      await db
        .insert(likes)
        .values({
          songId,
          userId,
        });
      
      // Increment song likes count
      await db
        .update(songs)
        .set({
          likes: sql`${songs.likes} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(songs.id, songId));

      // Get updated count
      const [song] = await db
        .select({ likes: songs.likes })
        .from(songs)
        .where(eq(songs.id, songId));

      return { liked: true, totalLikes: song.likes };
    }
  }

  // Toggle favorite on song
  async toggleFavorite(songId: string, userId: string): Promise<{ favorited: boolean }> {
    // Check if user already favorited this song
    const [existingFavorite] = await db
      .select()
      .from(userFavorites)
      .where(and(
        eq(userFavorites.songId, songId),
        eq(userFavorites.userId, userId)
      ));

    if (existingFavorite) {
      // Remove favorite
      await db
        .delete(userFavorites)
        .where(and(
          eq(userFavorites.songId, songId),
          eq(userFavorites.userId, userId)
        ));

      return { favorited: false };
    } else {
      // Add favorite
      await db
        .insert(userFavorites)
        .values({
          songId,
          userId,
        });

      return { favorited: true };
    }
  }

  private async updateUserStats(userId: string, field: 'lyrics_submitted' | 'annotations_count', increment: number): Promise<void> {
    const column = field === 'lyrics_submitted' ? userProfiles.lyricsSubmitted : userProfiles.annotationsCount;
    
    await db
      .update(userProfiles)
      .set({
        [field]: sql`${column} + ${increment}`,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));
  }
}