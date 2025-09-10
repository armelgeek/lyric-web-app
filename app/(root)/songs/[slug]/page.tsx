import SongDetailContent from '@/features/songs/components/organisms/song-detail';

interface SongPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SongPage({ params }: SongPageProps) {
  const { slug } = await params;
  
  return <SongDetailContent slug={slug} />;
}