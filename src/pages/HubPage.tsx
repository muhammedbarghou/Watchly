import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselNavigation,
  CarouselItem,
} from '@/components/ui/carousel';
import MainLayout from '@/components/layout/MainLayout';

// TypeScript interfaces for media items
interface MovieItem {
  id: number;
  title: string;
  name?: string;
  poster_path: string | null;
  release_date: string | null;
  first_air_date?: string | null;
  vote_average: number | null;
  overview?: string;
}

interface TVShowItem {
  id: number;
  name: string;
  title?: string;
  poster_path: string | null;
  first_air_date: string | null;
  release_date?: string | null;
  vote_average: number | null;
  overview?: string;
}

type MediaItem = MovieItem | TVShowItem;

// Props interface for MediaCard component
interface MediaCardProps {
  item: MediaItem;
  isMovie?: boolean;
}

// Media Item Card Component
const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
  return (
    <div className="group flex flex-col h-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md">
      <div className="relative aspect-[2/3] w-full bg-gray-100 overflow-hidden">
        {item.poster_path ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={item.title || item.name || 'Media poster'}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 p-3">
            <span className="text-gray-500 text-xs font-medium text-center">{item.title || item.name}</span>
          </div>
        )}
        <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 mr-0.5">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
          {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
        </div>
      </div>
      <div className="p-2 flex-grow flex flex-col">
        <h3 className="font-medium text-xs line-clamp-1">{item.title || item.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {item.release_date ? new Date(item.release_date).getFullYear() : 
           item.first_air_date ? new Date(item.first_air_date).getFullYear() : ''}
        </p>
        {(item.overview) && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.overview}</p>
        )}
      </div>
    </div>
  );
};

// Props interface for MediaCarousel component
interface MediaCarouselProps {
  title: string;
  items: MediaItem[];
  loading: boolean;
  isMovie?: boolean;
}

// Media Carousel Component
const MediaCarousel: React.FC<MediaCarouselProps> = ({ title, items, loading, isMovie = true }) => {
  if (loading) {
    return (
      <div className="w-full py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="flex justify-center items-center h-40 border border-dashed rounded-lg border-gray-300 dark:border-gray-700">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <div className="relative w-full">
        <Carousel>
          <CarouselContent className="-ml-2">
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-2 basis-1/4 sm:basis-1/5 md:basis-1/6 lg:basis-1/7">
                <MediaCard item={item} isMovie={isMovie} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNavigation
            className="absolute -bottom-12 left-auto top-auto w-full justify-end gap-2"
            classNameButton="bg-zinc-800 *:stroke-zinc-50 dark:bg-zinc-200 dark:*:stroke-zinc-800"
            alwaysShow
          />
        </Carousel>
      </div>
    </div>
  );
};

// Main Component
export function HubPage(): JSX.Element {
  // State for each category
  const [topRatedMovies, setTopRatedMovies] = useState<MovieItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieItem[]>([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState<TVShowItem[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<TVShowItem[]>([]);
  
  // Loading states
  const [loadingTopMovies, setLoadingTopMovies] = useState<boolean>(true);
  const [loadingPopularMovies, setLoadingPopularMovies] = useState<boolean>(true);
  const [loadingTopTV, setLoadingTopTV] = useState<boolean>(true);
  const [loadingPopularTV, setLoadingPopularTV] = useState<boolean>(true);

  // API Key
  const API_KEY = 'fa9851a1758dc638be1831fefc5205c1';

  useEffect(() => {
    // Fetch Top Rated Movies
    const fetchTopRatedMovies = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch top rated movies');
        }
        
        const data = await response.json();
        setTopRatedMovies(data.results.slice(0, 20));
      } catch (error) {
        console.error('Error fetching top rated movies:', error);
        // Set fallback data
        setTopRatedMovies(generateFallbackData('Movie', 20, true));
      } finally {
        setLoadingTopMovies(false);
      }
    };

    // Fetch Popular Movies
    const fetchPopularMovies = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch popular movies');
        }
        
        const data = await response.json();
        setPopularMovies(data.results.slice(0, 20));
      } catch (error) {
        console.error('Error fetching popular movies:', error);
        setPopularMovies(generateFallbackData('Popular Film', 20, true));
      } finally {
        setLoadingPopularMovies(false);
      }
    };

    // Fetch Top Rated TV Shows
    const fetchTopRatedTVShows = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}&language=en-US&page=1`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch top rated TV shows');
        }
        
        const data = await response.json();
        setTopRatedTVShows(data.results.slice(0, 20));
      } catch (error) {
        console.error('Error fetching top rated TV shows:', error);
        setTopRatedTVShows(generateFallbackData('Series', 20, false));
      } finally {
        setLoadingTopTV(false);
      }
    };

    // Fetch Popular TV Shows
    const fetchPopularTVShows = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch popular TV shows');
        }
        
        const data = await response.json();
        setPopularTVShows(data.results.slice(0, 20));
      } catch (error) {
        console.error('Error fetching popular TV shows:', error);
        setPopularTVShows(generateFallbackData('Popular Show', 20, false));
      } finally {
        setLoadingPopularTV(false);
      }
    };

    // Generate fallback data if API fails
    const generateFallbackData = (prefix: string, count: number, isMovie: boolean = true): any[] => {
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        title: isMovie ? `${prefix} ${i + 1}` : undefined,
        name: !isMovie ? `${prefix} ${i + 1}` : undefined,
        poster_path: null,
        release_date: isMovie ? '2023-01-01' : null,
        first_air_date: !isMovie ? '2023-01-01' : null,
        vote_average: 7.5,
        overview: `This is a placeholder for ${isMovie ? 'movie' : 'TV show'} data.`
      }));
    };

    // Fetch all data
    fetchTopRatedMovies();
    fetchPopularMovies();
    fetchTopRatedTVShows();
    fetchPopularTVShows();
  }, []);

  return (
    <MainLayout>
      <div className="w-full space-y-6">
        <MediaCarousel 
          title="Best Movies of All Time" 
          items={topRatedMovies} 
          loading={loadingTopMovies} 
          isMovie={true}
        />
        
        <MediaCarousel 
          title="Popular Movies" 
          items={popularMovies} 
          loading={loadingPopularMovies} 
          isMovie={true}
        />
        
        <MediaCarousel 
          title="Best TV Shows" 
          items={topRatedTVShows} 
          loading={loadingTopTV} 
          isMovie={false}
        />
        
        <MediaCarousel 
          title="Popular TV Shows" 
          items={popularTVShows} 
          loading={loadingPopularTV} 
          isMovie={false}
        />
      </div>
    </MainLayout>
  );
}

export default HubPage;