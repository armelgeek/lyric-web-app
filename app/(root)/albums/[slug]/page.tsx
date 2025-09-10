import AlbumDetail from '@/features/songs/components/organisms/album-detail';

interface AlbumPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params;
  
  return <AlbumDetail slug={slug} />;
}