import { SongService } from '../service';
import { SearchSongsPayload, PaginatedResponse, SongWithUser } from '../../config/song.types';

const songService = new SongService();

export async function searchSongsUseCase(
  filters: SearchSongsPayload
): Promise<PaginatedResponse<SongWithUser>> {
  try {
    return await songService.searchSongs(filters);
  } catch (error) {
    console.error('Error searching songs:', error);
    throw new Error('Failed to search songs');
  }
}

export async function getTrendingSongsUseCase(
  limit: number = 10
): Promise<SongWithUser[]> {
  try {
    return await songService.getTrendingSongs(limit);
  } catch (error) {
    console.error('Error getting trending songs:', error);
    throw new Error('Failed to get trending songs');
  }
}