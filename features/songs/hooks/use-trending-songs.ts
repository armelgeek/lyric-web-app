'use client';

import { useState, useEffect } from 'react';
import { getTrendingSongsUseCase } from '../domain/use-cases/search-songs.use-case';
import { SongWithUser } from '../config/song.types';

export function useTrendingSongs(limit: number = 10) {
  const [songs, setSongs] = useState<SongWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrendingSongs() {
      try {
        setLoading(true);
        setError(null);
        const trendingSongs = await getTrendingSongsUseCase(limit);
        setSongs(trendingSongs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trending songs');
      } finally {
        setLoading(false);
      }
    }

    fetchTrendingSongs();
  }, [limit]);

  return { songs, loading, error };
}