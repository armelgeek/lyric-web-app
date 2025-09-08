import { SongService } from '../service';
import { CreateSongPayload, Song } from '../../config/song.types';

const songService = new SongService();

export async function createSongUseCase(
  data: CreateSongPayload,
  userId: string
): Promise<Song> {
  try {
    // Validate that user has permission to create songs
    // For now, any authenticated user can create songs
    
    const song = await songService.createSong(data, userId);
    
    return song;
  } catch (error) {
    console.error('Error creating song:', error);
    throw new Error('Failed to create song');
  }
}