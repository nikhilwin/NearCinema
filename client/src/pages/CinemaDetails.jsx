import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { MapPin, Film, Calendar, Star, Clock } from 'lucide-react';

const CinemaDetails = () => {
  const { id } = useParams();
  const [cinema, setCinema] = useState(null);
  const [shows, setShows] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingShows, setLoadingShows] = useState(true);

  // Generate dates
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

  // Fetch cinema details
  useEffect(() => {
    const fetchCinema = async () => {
      setLoading(true);
      try {
        const data = await api.getCinemaById(id);
        setCinema(data);
      } catch (err) {
        console.error("Error fetching cinema details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCinema();
  }, [id]);

  // Fetch shows
  useEffect(() => {
    if (!selectedDate) return;

    const fetchShows = async () => {
      setLoadingShows(true);
      try {
        const data = await api.getShows({ cinemaId: id, date: selectedDate });
        setShows(data);
      } catch (err) {
        console.error("Error fetching shows:", err);
      } finally {
        setLoadingShows(false);
      }
    };
    fetchShows();
  }, [id, selectedDate]);

  if (loading || !cinema) {
    return (
      <div className="container mx-auto px-6 py-12 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-red"></div>
      </div>
    );
  }

  // Group shows by Movie
  const showsByMovie = shows.reduce((acc, show) => {
    if (!show.movie) return acc;
    const movieId = show.movie._id;
    if (!acc[movieId]) {
      acc[movieId] = {
        title: show.movie.title,
        poster: show.movie.poster,
        genre: show.movie.genre,
        duration: show.movie.duration,
        rating: show.movie.rating,
        shows: []
      };
    }
    acc[movieId].shows.push(show);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Cinema Header Card */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-red/10 rounded-full blur-3xl"></div>
        
        <div className="space-y-3 relative z-10">
          <span className="bg-brand-red/10 border border-brand-red/20 text-brand-red px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Theatre Partner
          </span>
          <h1 className="text-3xl font-black text-white text-glow">{cinema.name}</h1>
          <p className="text-slate-400 text-sm flex items-center gap-1.5">
            <MapPin className="h-4.5 w-4.5 text-brand-red" />
            {cinema.city} • Coords: ({cinema.latitude}, {cinema.longitude})
          </p>
        </div>

        <div className="relative z-10 bg-slate-900/60 border border-white/5 p-4 rounded-2xl text-xs text-slate-400 max-w-xs leading-relaxed">
          Need assistance? Talk to box office at our premium information desk inside the mall. Seating capacity: 250 per screen.
        </div>
      </div>

      {/* Date Selector & Showtimes */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-red" />
            <span>Schedule Selection</span>
          </h2>

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
              <div key={i} className="animate-pulse glass-panel p-6 h-36 rounded-2xl"></div>
            ))}
          </div>
        ) : Object.keys(showsByMovie).length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl text-slate-500">
            No movies scheduled at {cinema.name} on this date.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(showsByMovie).map((movie) => (
              <div 
                key={movie.title}
                className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-6 hover:border-white/10 transition"
              >
                {/* Movie poster left */}
                <div className="w-24 md:w-32 aspect-[2/3] rounded-xl overflow-hidden border border-white/5 shrink-0">
                  <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                </div>

                {/* Movie Info and showtimes right */}
                <div className="flex-grow flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-white text-lg md:text-xl">{movie.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-semibold">
                      <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
                        <Star className="h-3.5 w-3.5 fill-yellow-500" />
                        {movie.rating}
                      </span>
                      <span>{movie.genre}</span>
                      <span>•</span>
                      <span>{movie.duration}</span>
                    </div>
                  </div>

                  {/* Show buttons */}
                  <div className="flex flex-wrap gap-3">
                    {movie.shows.map((show) => (
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaDetails;
