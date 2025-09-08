import { z } from 'zod';

// Song creation schema
export const createSongSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  artist: z.string().min(1, 'Artist is required').max(100, 'Artist name too long'),
  album: z.string().max(100, 'Album name too long').optional(),
  releaseDate: z.date().optional(),
  genre: z.enum([
    'pop', 'rock', 'hip-hop', 'r&b', 'country', 'jazz', 'blues', 'electronic',
    'folk', 'classical', 'reggae', 'punk', 'metal', 'indie', 'alternative', 'other'
  ]).optional(),
  lyrics: z.string().min(10, 'Lyrics must be at least 10 characters').max(50000, 'Lyrics too long'),
  spotifyUrl: z.string().url('Invalid Spotify URL').optional().or(z.literal('')),
  youtubeUrl: z.string().url('Invalid YouTube URL').optional().or(z.literal('')),
  appleMusicUrl: z.string().url('Invalid Apple Music URL').optional().or(z.literal('')),
});

// Song update schema
export const updateSongSchema = createSongSchema.partial();

// Song search schema
export const searchSongsSchema = z.object({
  query: z.string().optional(),
  artist: z.string().optional(),
  genre: z.enum([
    'pop', 'rock', 'hip-hop', 'r&b', 'country', 'jazz', 'blues', 'electronic',
    'folk', 'classical', 'reggae', 'punk', 'metal', 'indie', 'alternative', 'other'
  ]).optional(),
  sortBy: z.enum(['views', 'likes', 'title', 'artist', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Annotation creation schema
export const createAnnotationSchema = z.object({
  songId: z.string().min(1, 'Song ID is required'),
  highlightedText: z.string().min(1, 'Highlighted text is required').max(1000, 'Highlighted text too long'),
  startPosition: z.number().min(0, 'Start position must be non-negative'),
  endPosition: z.number().min(0, 'End position must be non-negative'),
  explanation: z.string().min(5, 'Explanation must be at least 5 characters').max(5000, 'Explanation too long'),
}).refine(data => data.endPosition > data.startPosition, {
  message: 'End position must be greater than start position',
  path: ['endPosition'],
});

// Comment creation schema
export const createCommentSchema = z.object({
  songId: z.string().optional(),
  annotationId: z.string().optional(),
  parentId: z.string().optional(),
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
}).refine(data => data.songId || data.annotationId, {
  message: 'Comment must be associated with either a song or annotation',
});

// User profile update schema
export const updateUserProfileSchema = z.object({
  bio: z.string().max(500, 'Bio too long').optional(),
  role: z.enum(['fan', 'contributor', 'moderator', 'artist', 'admin']).optional(),
});

// Report creation schema
export const createReportSchema = z.object({
  songId: z.string().optional(),
  annotationId: z.string().optional(),
  commentId: z.string().optional(),
  userId: z.string().optional(),
  reason: z.enum(['inappropriate_content', 'spam', 'harassment', 'copyright', 'misinformation', 'other']),
  description: z.string().max(1000, 'Description too long').optional(),
}).refine(data => data.songId || data.annotationId || data.commentId || data.userId, {
  message: 'Report must target a song, annotation, comment, or user',
});