'use client';

import { useState, useEffect } from 'react';
import { SongWithUser } from '../config/song.types';

// Mock data for development/demo purposes
const mockTrendingSongs: SongWithUser[] = [
  {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    genre: 'rock',
    lyrics: 'Is this the real life? Is this just fantasy?\nCaught in a landslide, no escape from reality...',
    submittedBy: 'user1',
    views: 1234567,
    likes: 45678,
    annotationsCount: 89,
    commentsCount: 234,
    isApproved: true,
    slug: 'queen-bohemian-rhapsody',
    createdAt: new Date(),
    updatedAt: new Date(),
    submittedByUser: {
      id: 'user1',
      name: 'Music Lover',
      image: undefined,
    },
  },
  {
    id: '2',
    title: 'Imagine',
    artist: 'John Lennon',
    genre: 'pop',
    lyrics: 'Imagine there\'s no heaven\nIt\'s easy if you try\nNo hell below us\nAbove us only sky...',
    submittedBy: 'user2',
    views: 987654,
    likes: 34567,
    annotationsCount: 67,
    commentsCount: 189,
    isApproved: true,
    slug: 'john-lennon-imagine',
    createdAt: new Date(),
    updatedAt: new Date(),
    submittedByUser: {
      id: 'user2',
      name: 'Classic Rock Fan',
      image: undefined,
    },
  },
  {
    id: '3',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    album: 'Thriller',
    genre: 'pop',
    lyrics: 'Billie Jean is not my lover\nShe\'s just a girl who claims that I am the one\nBut the kid is not my son...',
    submittedBy: 'user3',
    views: 876543,
    likes: 23456,
    annotationsCount: 45,
    commentsCount: 123,
    isApproved: true,
    slug: 'michael-jackson-billie-jean',
    createdAt: new Date(),
    updatedAt: new Date(),
    submittedByUser: {
      id: 'user3',
      name: 'Pop Music Expert',
      image: undefined,
    },
  },
];

export function useTrendingSongs(limit: number = 10) {
  const [songs, setSongs] = useState<SongWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrendingSongs() {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API first
        try {
          const response = await fetch(`/api/v1/songs/trending?limit=${limit}`);
          const result = await response.json();
          
          if (response.ok && result.success) {
            setSongs(result.data);
            return;
          }
        } catch (apiError) {
          console.log('API not available, using mock data');
        }
        
        // Fallback to mock data
        const limitedMockData = mockTrendingSongs.slice(0, limit);
        setSongs(limitedMockData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trending songs');
        console.error('Error fetching trending songs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrendingSongs();
  }, [limit]);

  return { songs, loading, error };
}