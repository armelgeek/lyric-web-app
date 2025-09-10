import SearchPageContent from '@/features/songs/components/organisms/search-page';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; artist?: string; genre?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  
  return <SearchPageContent searchParams={params} />;
}