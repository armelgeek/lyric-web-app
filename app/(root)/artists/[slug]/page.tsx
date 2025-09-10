import ArtistDetail from '@/features/songs/components/organisms/artist-detail';

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  
  return <ArtistDetail slug={slug} />;
}