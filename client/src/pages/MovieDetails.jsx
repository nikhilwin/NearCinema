import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Star, Clock, Globe, Film, Calendar, MapPin, Sparkles } from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingShows, setLoadingShows] = useState(true);

  // Generate date selectors
  useEffect(() => {
    const today = new Date();
    const generatedDates = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const yyyymmdd = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
      generatedDates.push({ date: yyyymmdd, label });
    }
    setDates(generatedDates);
    setSelectedDate(generatedDates[0].date);
  }, []);

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const data = await api.getMovieById(id);
        setMovie(data);
      } catch (err) {
        console.error("Error fetching movie details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // Fetch all movies for similar recommendations
  useEffect(() => {
    api.getMovies()
      .then(data => setAllMovies(data))
      .catch(err => console.error("Error loading similar movies:", err));
  }, []);

  // Fetch shows when date or movie changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchShows = async () => {
      setLoadingShows(true);
      try {
        const data = await api.getShows({ movieId: id, date: selectedDate });
        setShows(data);
      } catch (err) {
        console.error("Error fetching shows:", err);
      } finally {
        setLoadingShows(false);
      }
    };
    fetchShows();
  }, [id, selectedDate]);

  if (loading || !movie) {
    return (
      <div className="container mx-auto px-6 py-12 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-red"></div>
      </div>
    );
  }

  // Group shows by cinemaId
  const showsByCinema = shows.reduce((acc, show) => {
    if (!show.cinema) return acc;
    const cinemaId = show.cinema._id;
    if (!acc[cinemaId]) {
      acc[cinemaId] = {
        name: show.cinema.name,
        city: show.cinema.city,
        shows: []
      };
    }
    acc[cinemaId].shows.push(show);
    return acc;
  }, {});

  // Calculate similar movies
  const getSimilarMovies = () => {
    if (!movie || allMovies.length === 0) return [];
    const currentGenres = movie.genre.split(',').map(g => g.trim().toLowerCase());
    return allMovies
      .filter(m => m._id !== movie._id)
      .filter(m => {
        const genres = m.genre.split(',').map(g => g.trim().toLowerCase());
        return genres.some(g => currentGenres.includes(g));
      })
      .slice(0, 4); // Show top 4 similar recommendations
  };

  const similarMovies = getSimilarMovies();

  return (
    <div className="space-y-8 pb-12">
      {/* Backdrop Hero section */}
      <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent z-10"></div>
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover blur-md opacity-30 scale-105"
        />
        
        {/* Info Overlay */}
        <div className="absolute inset-0 z-20 container mx-auto px-6 flex flex-col md:flex-row items-end gap-8 pb-8">
          {/* Card Poster */}
          <div className="hidden md:block w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* Text details */}
          <div className="space-y-4 pb-2">
            <h1 className="text-4xl md:text-5xl font-black text-white text-glow leading-tight">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-semibold text-slate-300">
              <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded-lg">
                <Star className="h-4 w-4 fill-yellow-500" />
                <span>{movie.rating} / 10</span>
              </div>
              <span className="bg-slate-800 border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                {movie.duration}
              </span>
              <span className="bg-slate-800 border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-slate-400" />
                {movie.language}
              </span>
              <span className="bg-slate-800 border border-white/5 px-2.5 py-1 rounded-lg">
                {movie.genre}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Synopsis & Showtimes */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-3">Synopsis</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{movie.description}</p>
          </div>

          {/* Showtime Listings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-red" />
                <span>Showtimes</span>
              </h2>

              {/* Date selectors */}
              <div className="flex gap-2">
                {dates.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDate === d.date
                        ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                        : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingShows ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse glass-panel p-6 h-28 rounded-2xl"></div>
                ))}
              </div>
            ) : Object.keys(showsByCinema).length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-2xl text-slate-500">
                No shows available for {movie.title} on this date.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.values(showsByCinema).map((cinema) => (
                  <div 
                    key={cinema.name} 
                    className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div>
                      <h3 className="font-extrabold text-white text-lg flex items-center gap-1.5">
                        <Film className="h-4.5 w-4.5 text-brand-red" />
                        {cinema.name}
                      </h3>
                      <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {cinema.city}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {cinema.shows.map((show) => (
                        <Link
                          to={`/select-seats/${show._id}`}
                          key={show._id}
                          className="bg-slate-900 border border-white/10 hover:border-brand-red hover:bg-brand-red/10 text-brand-red text-sm font-extrabold px-5 py-2.5 rounded-xl transition duration-200 text-center"
                        >
                          <div className="text-white text-xs font-medium mb-0.5">{show.time}</div>
                          <div className="text-[10px] text-slate-500 font-bold">₹{show.price}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Poster & Similar Movies */}
        <div className="space-y-6">
          {/* Poster (visible on desktop) */}
          <div className="hidden lg:block rounded-2xl overflow-hidden aspect-[2/3] border border-white/5">
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* More Like This (Similar Movies recommendation) */}
          {similarMovies.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center gap-1.5 text-white font-extrabold text-sm border-b border-white/5 pb-2">
                <Sparkles className="h-4 w-4 text-brand-red" />
                <span>More Like This</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {similarMovies.map(sim => (
                  <Link 
                    key={sim._id} 
                    to={`/movie/${sim._id}`}
                    className="group flex flex-col bg-slate-950/40 rounded-xl overflow-hidden border border-white/5 hover:border-brand-red/20 transition"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img src={sim.poster} alt={sim.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div className="p-2">
                      <span className="text-[10px] font-black text-white line-clamp-1 group-hover:text-brand-red transition">{sim.title}</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">{sim.genre.split(',')[0]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
