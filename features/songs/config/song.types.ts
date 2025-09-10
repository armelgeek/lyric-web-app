import { z } from 'zod';
import { 
  createSongSchema, 
  updateSongSchema, 
  searchSongsSchema,
  createAnnotationSchema,
  createCommentSchema,
  updateUserProfileSchema,
  createReportSchema
} from './song.schema';

// Type definitions for the lyrics platform
export type CreateSongPayload = z.infer<typeof createSongSchema>;
export type UpdateSongPayload = z.infer<typeof updateSongSchema>;
export type SearchSongsPayload = z.infer<typeof searchSongsSchema>;
export type CreateAnnotationPayload = z.infer<typeof createAnnotationSchema>;
export type CreateCommentPayload = z.infer<typeof createCommentSchema>;
export type UpdateUserProfilePayload = z.infer<typeof updateUserProfileSchema>;
export type CreateReportPayload = z.infer<typeof createReportSchema>;

// Database model types (based on Drizzle schema)
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  releaseDate?: Date | null;
  genre?: string | null;
  lyrics: string;
  submittedBy: string;
  views: number;
  likes: number;
  annotationsCount: number;
  commentsCount: number;
  isApproved: boolean;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  slug: string;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  appleMusicUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Annotation {
  id: string;
  songId: string;
  userId: string;
  highlightedText: string;
  startPosition: number;
  endPosition: number;
  explanation: string;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  isApproved: boolean;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  songId?: string | null;
  annotationId?: string | null;
  parentId?: string | null;
  content: string;
  likes: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  role: 'fan' | 'contributor' | 'moderator' | 'artist' | 'admin';
  bio?: string | null;
  reputation: number;
  followersCount: number;
  followingCount: number;
  lyricsSubmitted: number;
  annotationsCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  id: string;
  userId: string;
  songId?: string;
  annotationId?: string;
  commentId?: string;
  createdAt: Date;
}

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  songId?: string;
  annotationId?: string;
  commentId?: string;
  userId?: string;
  reason: 'inappropriate_content' | 'spam' | 'harassment' | 'copyright' | 'misinformation' | 'other';
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface UserFavorite {
  id: string;
  userId: string;
  songId: string;
  createdAt: Date;
}

// Extended types with relations
export interface SongWithUser extends Song {
  submittedByUser: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface SongWithDetails extends SongWithUser {
  annotations: Annotation[];
  comments: Comment[];
  isLikedByUser?: boolean;
  isFavoriteByUser?: boolean;
}

export interface AnnotationWithUser extends Annotation {
  user: {
    id: string;
    name: string;
    image?: string;
  };
  song: {
    id: string;
    title: string;
    artist: string;
  };
  isUpvotedByUser?: boolean;
  isDownvotedByUser?: boolean;
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string;
    image?: string;
  };
  replies?: CommentWithUser[];
  isLikedByUser?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and filter types
export interface SongFilters {
  query?: string;
  artist?: string;
  genre?: string;
  isApproved?: boolean;
  submittedBy?: string;
}

export interface TrendingData {
  trendingSongs: Song[];
  trendingAnnotations: AnnotationWithUser[];
  recentlyAdded: Song[];
  topContributors: UserProfile[];
}