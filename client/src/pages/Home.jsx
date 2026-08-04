import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { MapPin, Film, Star, Clock, Navigation, Compass, Sparkles, Brain } from 'lucide-react';

const Home = ({ selectedCity, userLocation, searchQuery }) => {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingCinemas, setLoadingCinemas] = useState(true);
  const [cinemaError, setCinemaError] = useState('');

  // AI Recommendation states
  const [selectedAiGenres, setSelectedAiGenres] = useState([]);
  const genresList = ["Action", "Sci-Fi", "Animation", "Drama", "Comedy", "Thriller"];

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

  // Fetch cinemas
  useEffect(() => {
    const fetchCinemas = async () => {
      setLoadingCinemas(true);
      setCinemaError('');
      try {
        let params = {};
        if (userLocation) {
          params.latitude = userLocation.latitude;
          params.longitude = userLocation.longitude;
          params.radius = 30;
        } else if (selectedCity) {
          params.city = selectedCity;
        } else {
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

  // Fetch user bookings for AI profiling
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getUserBookings()
        .then(data => setUserBookings(data))
        .catch(err => console.error("Error loading user bookings for AI profiling:", err));
    }
  }, []);

  const handleGenreToggle = (genre) => {
    if (selectedAiGenres.includes(genre)) {
      setSelectedAiGenres(selectedAiGenres.filter(g => g !== genre));
    } else {
      setSelectedAiGenres([...selectedAiGenres, genre]);
    }
  };

  // AI logic to process recommendations
  const getAiRecommendations = () => {
    if (movies.length === 0) return { type: 'none', list: [] };

    // 1. History-based profiling (if user has bookings)
    if (userBookings.length > 0) {
      const genreCounts = {};
      userBookings.forEach(booking => {
        if (booking.movie && booking.movie.genre) {
          const parts = booking.movie.genre.split(',').map(g => g.trim());
          parts.forEach(g => {
            genreCounts[g] = (genreCounts[g] || 0) + 1;
          });
        }
      });

      let topGenre = '';
      let maxCount = 0;
      for (const genre in genreCounts) {
        if (genreCounts[genre] > maxCount) {
          maxCount = genreCounts[genre];
          topGenre = genre;
        }
      }

      if (topGenre) {
        // Recommend movies matching top booked genre (excluding already booked movies)
        const bookedMovieIds = userBookings.map(b => b.movie?._id);
        const filtered = movies.filter(m => 
          m.genre.toLowerCase().includes(topGenre.toLowerCase()) && 
          !bookedMovieIds.includes(m._id)
        );

        if (filtered.length > 0) {
          return { type: 'history', value: topGenre, list: filtered.slice(0, 5) };
        }
      }
    }

    // 2. Preference-based (manual selector)
    if (selectedAiGenres.length > 0) {
      const filtered = movies.filter(m => 
        selectedAiGenres.some(g => m.genre.toLowerCase().includes(g.toLowerCase()))
      );
      return { type: 'preference', value: selectedAiGenres.join(', '), list: filtered.slice(0, 5) };
    }

    return { type: 'none', list: [] };
  };

  const aiResult = getAiRecommendations();

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

      {/* AI Recommendation Panel */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden space-y-6">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-rose-500/5 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-rose-500 to-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-rose-500/10">
              <Brain className="h-5.5 w-5.5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-1.5">
                AI Movie Engine <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded">v1.2</span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">Smart personalized recommendations powered by your taste and booking history.</p>
            </div>
          </div>

          {/* Profile mode tag */}
          {aiResult.type === 'history' && (
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-spin" /> Profile Analysis Active
            </span>
          )}
        </div>

        {/* Guest genre picker */}
        {userBookings.length === 0 && (
          <div className="space-y-3">
            <span className="text-slate-400 text-xs font-extrabold uppercase tracking-wide block">Select your favorite genres:</span>
            <div className="flex flex-wrap gap-2">
              {genresList.map(genre => {
                const isSelected = selectedAiGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-brand-red text-white shadow-md shadow-brand-red/20 border border-brand-red'
                        : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Results */}
        {aiResult.type !== 'none' ? (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-400">
              {aiResult.type === 'history' ? (
                <span>Because you frequently book <strong className="text-brand-red">{aiResult.value}</strong> films, the AI recommends:</span>
              ) : (
                <span>Showing recommended movies for your selected genres (<strong className="text-brand-red">{aiResult.value}</strong>):</span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {aiResult.list.map(movie => (
                <Link 
                  to={`/movie/${movie._id}`} 
                  key={movie._id}
                  className="group relative flex flex-col bg-slate-950/40 rounded-xl overflow-hidden border border-white/5 hover:border-brand-red/20 transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute top-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-bold text-white">{movie.rating}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-extrabold text-white text-xs line-clamp-1 group-hover:text-brand-red transition">{movie.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{movie.genre.split(',')[0]}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl text-center text-xs text-slate-500 leading-relaxed">
            {userBookings.length > 0 ? (
              "Loading profile recommendation engine..."
            ) : (
              "Select one or more favorite genres above to generate personalized AI recommendations instantly!"
            )}
          </div>
        )}
      </div>

      {/* Movies Grid Section */}
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
