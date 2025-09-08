import { SongWithUser } from '../../config/song.types';
import { SongCard } from '../molecules/song-card';

interface SongListProps {
  songs: SongWithUser[];
  title?: string;
  emptyMessage?: string;
}

export function SongList({ songs, title, emptyMessage = 'No songs found' }: SongListProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      )}
      
      {songs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}