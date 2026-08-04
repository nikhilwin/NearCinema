import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { MapPin, Film, Star, Clock, Navigation, Search } from 'lucide-react';

const Home = ({ selectedCity, userLocation, searchQuery }) => {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingCinemas, setLoadingCinemas] = useState(true);
  const [cinemaError, setCinemaError] = useState('');

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      setLoadingMovies(true);
      try {
        const data = await api.getMovies(searchQuery);
        setMovies(data);
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoadingMovies(false);
      }
    };
    fetchMovies();
  }, [searchQuery]);

  // Fetch cinemas based on selected city or user geolocation
  useEffect(() => {
    const fetchCinemas = async () => {
      setLoadingCinemas(true);
      setCinemaError('');
      try {
        let params = {};
        if (userLocation) {
          params.latitude = userLocation.latitude;
          params.longitude = userLocation.longitude;
          params.radius = 30; // 30km radius
        } else if (selectedCity) {
          params.city = selectedCity;
        } else {
          // If no city and no coordinates, default to Varanasi to make the homepage look rich
          params.city = "Varanasi";
        }

        const data = await api.getCinemas(params);
        setCinemas(data);
      } catch (err) {
        console.error("Error fetching cinemas:", err);
        setCinemaError('Could not fetch cinemas near you.');
      } finally {
        setLoadingCinemas(false);
      }
    };
    fetchCinemas();
  }, [selectedCity, userLocation]);

  return (
    <div className="container mx-auto px-6 py-8 space-y-12">
      {/* Hero Banner */}
      <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-red/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="space-y-4 md:max-w-xl relative z-10">
          <span className="bg-brand-red/10 border border-brand-red/20 text-brand-red px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            Real-Time Location Booking
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Find Cinemas & Book Tickets <span className="text-gradient text-glow">Instantly</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            NearCinema automatically detects your location to discover available movie shows at theatres closest to you. Zero hassle, maximum entertainment.
          </p>
        </div>

        <div className="w-full md:w-auto relative z-10">
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border border-white/5">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-brand-red animate-pulse" />
              <span className="text-sm font-semibold text-slate-300">Current Scope</span>
            </div>
            <p className="text-lg font-bold text-white">
              {userLocation 
                ? "Searching via Coordinates (GPS)" 
                : selectedCity 
                  ? `Cinemas in ${selectedCity}` 
                  : "Varanasi (Default City)"}
            </p>
            <p className="text-xs text-slate-500">
              Change city or click "Detect GPS" in the top bar to update.
            </p>
          </div>
        </div>
      </div>

      {/* Movies Carousel/Grid Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-brand-red" />
            <h2 className="text-2xl font-black text-white">Recommended Movies</h2>
          </div>
          {searchQuery && (
            <span className="text-sm text-slate-400">
              Search results for "{searchQuery}"
            </span>
          )}
        </div>

        {loadingMovies ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="bg-slate-900 rounded-2xl aspect-[2/3]"></div>
                <div className="h-4 bg-slate-900 rounded w-3/4"></div>
                <div className="h-3 bg-slate-900 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl text-slate-400">
            No movies found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <Link 
                to={`/movie/${movie._id}`} 
                key={movie._id}
                className="group relative flex flex-col bg-slate-900/30 rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-white">{movie.rating}</span>
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <h3 className="font-bold text-white group-hover:text-brand-red transition text-sm md:text-base line-clamp-1">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>{movie.genre.split(',')[0]}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {movie.duration}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Cinemas Listings Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-brand-red" />
          <h2 className="text-2xl font-black text-white">Cinemas Nearby</h2>
        </div>

        {loadingCinemas ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse glass-panel p-6 rounded-2xl h-36"></div>
            ))}
          </div>
        ) : cinemaError ? (
          <div className="glass-panel p-12 text-center rounded-2xl text-slate-400">
            {cinemaError}
          </div>
        ) : cinemas.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl text-slate-400">
            No cinemas found matching the current location. Try detecting your location or choose another city.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cinemas.map((cinema) => (
              <Link
                to={`/cinema/${cinema._id}`}
                key={cinema._id}
                className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-brand-red/30 transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-extrabold text-white text-base md:text-lg group-hover:text-brand-red transition">
                      {cinema.name}
                    </h3>
                    {cinema.distance !== undefined && (
                      <span className="bg-brand-red/10 border border-brand-red/20 text-brand-red px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0">
                        {cinema.distance} km away
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-500" />
                    {cinema.city}
                  </p>
                </div>

                <div className="border-t border-white/5 mt-4 pt-4 flex items-center justify-between text-xs text-brand-red font-bold">
                  <span>View Showtimes</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
