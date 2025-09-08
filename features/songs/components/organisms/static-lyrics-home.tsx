import { Search, Plus, MessageSquare, Heart, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Mock trending songs for demo
const mockTrendingSongs = [
  {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    genre: 'rock',
    lyrics: 'Is this the real life? Is this just fantasy?\nCaught in a landslide, no escape from reality...',
    views: 1234567,
    likes: 45678,
    annotationsCount: 89,
    commentsCount: 234,
    submittedByUser: { name: 'Music Lover' },
  },
  {
    id: '2',
    title: 'Imagine',
    artist: 'John Lennon',
    genre: 'pop',
    lyrics: 'Imagine there\'s no heaven\nIt\'s easy if you try\nNo hell below us\nAbove us only sky...',
    views: 987654,
    likes: 34567,
    annotationsCount: 67,
    commentsCount: 189,
    submittedByUser: { name: 'Classic Rock Fan' },
  },
  {
    id: '3',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    album: 'Thriller',
    genre: 'pop',
    lyrics: 'Billie Jean is not my lover\nShe\'s just a girl who claims that I am the one\nBut the kid is not my son...',
    views: 876543,
    likes: 23456,
    annotationsCount: 45,
    commentsCount: 123,
    submittedByUser: { name: 'Pop Music Expert' },
  },
  {
    id: '4',
    title: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    genre: 'rock',
    lyrics: 'Welcome to the Hotel California\nSuch a lovely place\nSuch a lovely face...',
    views: 765432,
    likes: 19876,
    annotationsCount: 78,
    commentsCount: 98,
    submittedByUser: { name: 'Rock Historian' },
  },
  {
    id: '5',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    album: 'Nevermind',
    genre: 'alternative',
    lyrics: 'Load up on guns, bring your friends\nIt\'s fun to lose and to pretend...',
    views: 654321,
    likes: 15432,
    annotationsCount: 56,
    commentsCount: 87,
    submittedByUser: { name: 'Grunge Fan' },
  },
  {
    id: '6',
    title: 'Thriller',
    artist: 'Michael Jackson',
    album: 'Thriller',
    genre: 'pop',
    lyrics: 'It\'s close to midnight\nSomething evil\'s lurking in the dark...',
    views: 543210,
    likes: 13245,
    annotationsCount: 34,
    commentsCount: 76,
    submittedByUser: { name: 'MJ Expert' },
  },
];

export default function StaticLyricsHome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Discover Lyrics, Share Stories
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80">
              The platform where music lovers explore, annotate, and discuss their favorite songs
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search songs, artists, or lyrics..."
                  className="pl-10 bg-background text-foreground"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Submit Lyrics
              </Button>
              <Button variant="outline" size="lg">
                Explore All Songs
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Trending Songs */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Trending Songs</h2>
            <Button variant="outline">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTrendingSongs.map((song) => (
              <Card key={song.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{song.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                  {song.album && (
                    <p className="text-xs text-muted-foreground">{song.album}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      {song.genre}
                    </Badge>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {song.lyrics.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {song.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {song.likes.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {song.commentsCount}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      by {song.submittedByUser.name}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-center">
            What Makes Our Platform Special
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Discover & Search
                </CardTitle>
                <CardDescription>
                  Find lyrics to your favorite songs or discover new music through our powerful search
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Annotate & Discuss
                </CardTitle>
                <CardDescription>
                  Add explanations to lyrics, share interpretations, and discuss meanings with the community
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Contribute & Share
                </CardTitle>
                <CardDescription>
                  Submit new lyrics, help improve existing ones, and build the world's best lyrics database
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-6">
            Platform Statistics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Songs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Annotations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">25K+</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">100K+</div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}