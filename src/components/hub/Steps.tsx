import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselNavigation,
  CarouselItem,
} from '@/components/ui/carousel';

// Using TMDb API (The Movie Database)
export function MovieSuggestions() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Using TMDb API for popular movies with your API key
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=fa9851a1758dc638be1831fefc5205c1&language=en-US&page=1`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }
        
        const data = await response.json();
        setMovies(data.results.slice(0, 10));
      } catch (error) {
        console.error('Error fetching movies:', error);
        // Fallback data in case API fails
        setMovies([
          { id: 1, title: 'Action Movie', poster_path: null, release_date: '2023' },
          { id: 2, title: 'Comedy Film', poster_path: null, release_date: '2022' },
          { id: 3, title: 'Drama Story', poster_path: null, release_date: '2023' },
          { id: 4, title: 'Sci-Fi Adventure', poster_path: null, release_date: '2021' },
          { id: 5, title: 'Horror Night', poster_path: null, release_date: '2022' },
          { id: 6, title: 'Romantic Comedy', poster_path: null, release_date: '2023' },
          { id: 7, title: 'Mystery Thriller', poster_path: null, release_date: '2021' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Movie Suggestions</h2>
        </div>
        <div className="flex justify-center items-center h-64 border border-dashed rounded-lg border-gray-300 dark:border-gray-700">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-gray-500">Loading movie suggestions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Movie Suggestions</h2>
      </div>
      <div className="relative w-full">
        <Carousel>
          <CarouselContent className="-ml-4">
            {movies.map((movie) => (
              <CarouselItem key={movie.id} className="basis-1/3 pl-4">
                <div className="group flex flex-col h-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md">
                  <div className="relative aspect-[2/3] w-full bg-gray-100 overflow-hidden">
                    {movie.poster_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 p-3">
                        <span className="text-gray-500 text-sm font-medium text-center">{movie.title}</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                      {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 flex-grow flex flex-col">
                    <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
                    </p>
                    {movie.overview && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{movie.overview}</p>
                    )}
                  </div>
                  <div className="p-3 pt-0">
                    <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-1.5 px-3 rounded-md transition-colors">
                      Watch Together
                    </button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNavigation
            className="absolute -bottom-20 left-auto top-auto w-full justify-end gap-2"
            classNameButton="bg-zinc-800 *:stroke-zinc-50 dark:bg-zinc-200 dark:*:stroke-zinc-800"
            alwaysShow
          />
        </Carousel>
      </div>
    </div>
  );
}

export default MovieSuggestions;