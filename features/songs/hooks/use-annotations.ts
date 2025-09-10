'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AnnotationWithUser, CreateAnnotationPayload } from '../config/song.types';

// Hook for getting song annotations
export function useSongAnnotations(songId: string) {
  return useQuery({
    queryKey: ['annotations', songId],
    queryFn: async (): Promise<AnnotationWithUser[]> => {
      const response = await axios.get(`/api/v1/songs/${songId}/annotations`);
      return response.data.data;
    },
    enabled: !!songId,
  });
}

// Hook for creating annotations
export function useCreateAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnnotationPayload) => {
      const response = await axios.post(`/api/v1/songs/${data.songId}/annotations`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotations', variables.songId] });
      queryClient.invalidateQueries({ queryKey: ['songs', 'slug'] });
    },
  });
}

// Hook for voting on annotations
export function useVoteAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ annotationId, isUpvote }: { annotationId: string; isUpvote: boolean }) => {
      const response = await axios.post(`/api/v1/annotations/${annotationId}/vote`, { isUpvote });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
    },
  });
}