import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MovieCard from "@/components/MovieCard";
import axios from "axios";
import { addToWatchlist, getWatchlist } from "@/utils/localStorage";
import { Icons } from "@/components/icons";

const Carousel = ({ children, title }) => {
  const carouselRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    const el = carouselRef.current;
    if (el) {
      const progress = el.scrollWidth > el.clientWidth
        ? (el.scrollLeft / (el.scrollWidth - el.clientWidth)) * 100
        : 0;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      handleScroll(); // Set initial position
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [children]);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -carouselRef.current.offsetWidth : carouselRef.current.offsetWidth;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">{title}</h2>
      <div className="relative w-full group">
        <div
          className="flex overflow-x-auto scrollbar-hide space-x-6 py-4"
          ref={carouselRef}
        >
          {children}
        </div>
        <Button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 text-white hover:bg-black/80 shadow-lg backdrop-blur-sm rounded-full transition-all duration-300 z-20 opacity-0 group-hover:opacity-100"
        >
          <Icons.ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 text-white hover:bg-black/80 shadow-lg backdrop-blur-sm rounded-full transition-all duration-300 z-20 opacity-0 group-hover:opacity-100"
        >
          <Icons.ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      {/* Custom Scrollbar */}
      <div className="w-1/3 mx-auto mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-1 bg-white rounded-full"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function Home() {
  const [movie, setMovie] = useState("");
  const [recs, setRecs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trending, setTrending] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [activeView, setActiveView] = useState('trending'); // 'trending', 'recs', 'watchlist'

  const fetcher = async (movieName) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/recommend?movie_name=${encodeURIComponent(movieName)}`
      );
      return res.data.recommendations || [];
    } catch (err) {
      console.error(`Failed to fetch movies for ${movieName}:`, err);
      return [];
    }
  };

  useEffect(() => {
    fetcher("Inception").then(setTrending);
    setWatchlist(getWatchlist());
  }, []);

  const handleRecommend = async () => {
    if (!movie.trim()) return;
    setIsLoading(true);
    setError(null);
    const results = await fetcher(movie);
    if (results.length === 0) {
      setError(`No recommendations found for "${movie}".`);
    }
    setRecs(results);
    setActiveView('recs'); // Switch view to recommendations
    setIsLoading(false);
  };

  const handleAddToWatchlist = (movie) => {
    addToWatchlist(movie);
    setWatchlist(getWatchlist()); // Refresh watchlist state
  };

  const renderCarousel = () => {
    let movies, title;
    switch (activeView) {
      case 'recs':
        movies = recs;
        title = "Recommendations";
        break;
      case 'watchlist':
        movies = watchlist;
        title = "My Watchlist";
        break;
      default:
        movies = trending;
        title = "Trending Now";
    }

    if (isLoading) return <p className="text-center">Loading...</p>;
    if (error && activeView === 'recs') return <p className="text-center text-red-500">{error}</p>;
    if (movies.length === 0 && activeView === 'watchlist') {
      return <p className="text-center text-gray-400">Your watchlist is empty.</p>;
    }

    return (
      <Carousel title={title}>
        {movies.map((m) => (
          <MovieCard
            key={m.id}
            title={m.title}
            poster={m.poster || "https://via.placeholder.com/300x450?text=No+Image"}
            onAddToWatchlist={() => handleAddToWatchlist(m)}
          />
        ))}
      </Carousel>
    );
  };

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight">CineWave</h1>
          <p className="text-lg text-gray-400 mt-2">Discover movies you'll love.</p>
        </div>
        <div className="w-full max-w-3xl mx-auto flex space-x-2">
          <Input
            value={movie}
            onChange={(e) => setMovie(e.target.value)}
            placeholder="Search and get recommendations..."
            onKeyDown={(e) => e.key === "Enter" && handleRecommend()}
            className="flex-grow bg-white/10 text-white border-white/20 focus:ring-white/30"
          />
          <Button onClick={handleRecommend} disabled={isLoading} className="bg-white/90 text-black hover:bg-white">
            {isLoading ? "..." : "Search"}
          </Button>
        </div>
        <div className="flex justify-center space-x-4">
          <Button variant="ghost" onClick={() => setActiveView('trending')} className={activeView === 'trending' ? 'text-white' : 'text-gray-500'}>Trending</Button>
          <Button variant="ghost" onClick={() => setActiveView('watchlist')} className={activeView === 'watchlist' ? 'text-white' : 'text-gray-500'}>Watchlist</Button>
        </div>
      </div>

      <div className="w-full max-w-7xl mt-8">
        {renderCarousel()}
      </div>
    </div>
  );
}
