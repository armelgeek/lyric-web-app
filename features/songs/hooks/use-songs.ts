'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { 
  SongWithUser, 
  SongWithDetails, 
  PaginatedResponse, 
  SearchSongsPayload 
} from '../config/song.types';

// Hook for searching songs
export function useSongsSearch(filters: SearchSongsPayload) {
  return useQuery({
    queryKey: ['songs', 'search', filters],
    queryFn: async (): Promise<PaginatedResponse<SongWithUser>> => {
      const response = await axios.get('/api/v1/songs', { params: filters });
      return response.data;
    },
    enabled: !!(filters.query || filters.artist || filters.genre),
  });
}

// Hook for getting a single song by slug
export function useSong(slug: string) {
  return useQuery({
    queryKey: ['songs', slug],
    queryFn: async (): Promise<SongWithDetails> => {
      const response = await axios.get(`/api/v1/songs/slug/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
  });
}

// Hook for getting trending songs
export function useTrendingSongs(limit: number = 10) {
  return useQuery({
    queryKey: ['songs', 'trending', limit],
    queryFn: async (): Promise<SongWithUser[]> => {
      const response = await axios.get(`/api/v1/songs/trending?limit=${limit}`);
      return response.data.data;
    },
  });
}

// Hook for getting user's favorite songs
export function useFavoriteSongs(userId?: string) {
  return useQuery({
    queryKey: ['songs', 'favorites', userId],
    queryFn: async (): Promise<SongWithUser[]> => {
      const response = await axios.get('/api/v1/songs/favorites');
      return response.data.data;
    },
    enabled: !!userId,
  });
}

// Hook for liking/unliking a song
export function useLikeSong() {
  return useMutation({
    mutationFn: async (songId: string) => {
      const response = await axios.post(`/api/v1/songs/${songId}/like`);
      return response.data;
    },
  });
}

// Hook for favoriting/unfavoriting a song
export function useFavoriteSong() {
  return useMutation({
    mutationFn: async (songId: string) => {
      const response = await axios.post(`/api/v1/songs/${songId}/favorite`);
      return response.data;
    },
  });
}