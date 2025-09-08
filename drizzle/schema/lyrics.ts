import { sql } from 'drizzle-orm';
import { 
  boolean, 
  integer, 
  pgEnum, 
  pgTable, 
  text, 
  timestamp, 
  uuid,
  index
} from 'drizzle-orm/pg-core';
import { users } from './auth';

// Enums for lyrics platform
export const userRoleEnum = pgEnum('user_role', ['fan', 'contributor', 'moderator', 'artist', 'admin']);
export const songGenreEnum = pgEnum('song_genre', [
  'pop', 'rock', 'hip-hop', 'r&b', 'country', 'jazz', 'blues', 'electronic', 
  'folk', 'classical', 'reggae', 'punk', 'metal', 'indie', 'alternative', 'other'
]);
export const reportStatusEnum = pgEnum('report_status', ['pending', 'resolved', 'dismissed']);
export const reportReasonEnum = pgEnum('report_reason', [
  'inappropriate_content', 'spam', 'harassment', 'copyright', 'misinformation', 'other'
]);

// Extended user fields for lyrics platform
export const userProfiles = pgTable('user_profiles', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  role: userRoleEnum('role').notNull().default('fan'),
  bio: text('bio'),
  reputation: integer('reputation').notNull().default(0),
  followersCount: integer('followers_count').notNull().default(0),
  followingCount: integer('following_count').notNull().default(0),
  lyricsSubmitted: integer('lyrics_submitted').notNull().default(0),
  annotationsCount: integer('annotations_count').notNull().default(0),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('user_profiles_user_id_idx').on(table.userId),
  roleIdx: index('user_profiles_role_idx').on(table.role),
  reputationIdx: index('user_profiles_reputation_idx').on(table.reputation),
}));

// Songs table
export const songs = pgTable('songs', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album'),
  releaseDate: timestamp('release_date'),
  genre: songGenreEnum('genre'),
  lyrics: text('lyrics').notNull(),
  submittedBy: text('submitted_by')
    .notNull()
    .references(() => users.id),
  views: integer('views').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  annotationsCount: integer('annotations_count').notNull().default(0),
  commentsCount: integer('comments_count').notNull().default(0),
  isApproved: boolean('is_approved').notNull().default(false),
  approvedBy: text('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  slug: text('slug').notNull().unique(),
  spotifyUrl: text('spotify_url'),
  youtubeUrl: text('youtube_url'),
  appleMusicUrl: text('apple_music_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  titleIdx: index('songs_title_idx').on(table.title),
  artistIdx: index('songs_artist_idx').on(table.artist),
  genreIdx: index('songs_genre_idx').on(table.genre),
  submittedByIdx: index('songs_submitted_by_idx').on(table.submittedBy),
  slugIdx: index('songs_slug_idx').on(table.slug),
  viewsIdx: index('songs_views_idx').on(table.views),
  likesIdx: index('songs_likes_idx').on(table.likes),
  approvedIdx: index('songs_approved_idx').on(table.isApproved),
  createdAtIdx: index('songs_created_at_idx').on(table.createdAt),
}));

// Annotations table
export const annotations = pgTable('annotations', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  songId: text('song_id')
    .notNull()
    .references(() => songs.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  highlightedText: text('highlighted_text').notNull(),
  startPosition: integer('start_position').notNull(),
  endPosition: integer('end_position').notNull(),
  explanation: text('explanation').notNull(),
  upvotes: integer('upvotes').notNull().default(0),
  downvotes: integer('downvotes').notNull().default(0),
  commentsCount: integer('comments_count').notNull().default(0),
  isApproved: boolean('is_approved').notNull().default(true),
  approvedBy: text('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  songIdIdx: index('annotations_song_id_idx').on(table.songId),
  userIdIdx: index('annotations_user_id_idx').on(table.userId),
  positionIdx: index('annotations_position_idx').on(table.startPosition, table.endPosition),
  upvotesIdx: index('annotations_upvotes_idx').on(table.upvotes),
  approvedIdx: index('annotations_approved_idx').on(table.isApproved),
  createdAtIdx: index('annotations_created_at_idx').on(table.createdAt),
}));

// Comments table (for songs and annotations)
export const comments = pgTable('comments', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  songId: text('song_id').references(() => songs.id, { onDelete: 'cascade' }),
  annotationId: text('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }),
  parentId: text('parent_id').references(() => comments.id), // For replies
  content: text('content').notNull(),
  likes: integer('likes').notNull().default(0),
  isApproved: boolean('is_approved').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('comments_user_id_idx').on(table.userId),
  songIdIdx: index('comments_song_id_idx').on(table.songId),
  annotationIdIdx: index('comments_annotation_id_idx').on(table.annotationId),
  parentIdIdx: index('comments_parent_id_idx').on(table.parentId),
  approvedIdx: index('comments_approved_idx').on(table.isApproved),
  createdAtIdx: index('comments_created_at_idx').on(table.createdAt),
}));

// User relationships (follows)
export const userFollows = pgTable('user_follows', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  followerId: text('follower_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  followingId: text('following_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  followerIdx: index('user_follows_follower_idx').on(table.followerId),
  followingIdx: index('user_follows_following_idx').on(table.followingId),
  uniqueFollow: index('user_follows_unique_idx').on(table.followerId, table.followingId),
}));

// User likes (for songs and annotations)
export const likes = pgTable('likes', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  songId: text('song_id').references(() => songs.id, { onDelete: 'cascade' }),
  annotationId: text('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }),
  commentId: text('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('likes_user_id_idx').on(table.userId),
  songIdIdx: index('likes_song_id_idx').on(table.songId),
  annotationIdIdx: index('likes_annotation_id_idx').on(table.annotationId),
  commentIdIdx: index('likes_comment_id_idx').on(table.commentId),
}));

// Annotation votes (separate from likes for more granular voting)
export const annotationVotes = pgTable('annotation_votes', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  annotationId: text('annotation_id')
    .notNull()
    .references(() => annotations.id, { onDelete: 'cascade' }),
  isUpvote: boolean('is_upvote').notNull(), // true for upvote, false for downvote
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('annotation_votes_user_id_idx').on(table.userId),
  annotationIdIdx: index('annotation_votes_annotation_id_idx').on(table.annotationId),
  uniqueVote: index('annotation_votes_unique_idx').on(table.userId, table.annotationId),
}));

// Messages table (direct messaging)
export const messages = pgTable('messages', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  senderId: text('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  recipientId: text('recipient_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  senderIdx: index('messages_sender_idx').on(table.senderId),
  recipientIdx: index('messages_recipient_idx').on(table.recipientId),
  isReadIdx: index('messages_is_read_idx').on(table.isRead),
  createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
}));

// Reports table (content moderation)
export const reports = pgTable('reports', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reporterId: text('reporter_id')
    .notNull()
    .references(() => users.id),
  songId: text('song_id').references(() => songs.id, { onDelete: 'cascade' }),
  annotationId: text('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }),
  commentId: text('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id), // For reporting users
  reason: reportReasonEnum('reason').notNull(),
  description: text('description'),
  status: reportStatusEnum('status').notNull().default('pending'),
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  reporterIdx: index('reports_reporter_idx').on(table.reporterId),
  songIdIdx: index('reports_song_id_idx').on(table.songId),
  annotationIdIdx: index('reports_annotation_id_idx').on(table.annotationId),
  commentIdIdx: index('reports_comment_id_idx').on(table.commentId),
  statusIdx: index('reports_status_idx').on(table.status),
  reasonIdx: index('reports_reason_idx').on(table.reason),
  createdAtIdx: index('reports_created_at_idx').on(table.createdAt),
}));

// User saved/favorite songs
export const userFavorites = pgTable('user_favorites', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  songId: text('song_id')
    .notNull()
    .references(() => songs.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('user_favorites_user_id_idx').on(table.userId),
  songIdIdx: index('user_favorites_song_id_idx').on(table.songId),
  uniqueFavorite: index('user_favorites_unique_idx').on(table.userId, table.songId),
}));