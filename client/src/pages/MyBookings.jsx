import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Ticket, Calendar, Clock, Film, MapPin, ChevronRight, AlertCircle } from 'lucide-react';

const MyBookings = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await api.getUserBookings();
        setBookings(data);
      } catch (err) {
        console.error("Error fetching user bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-2.5">
          <Ticket className="h-7 w-7 text-brand-red" />
          <span>My Ticket Bookings</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Review your tickets, showtimes, and booking receipts.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl text-slate-400 flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-slate-600" />
          <div>
            <p className="text-base font-bold text-white mb-1">No Bookings Found</p>
            <p className="text-sm text-slate-500">You haven't booked any movie tickets yet.</p>
          </div>
          <Link
            to="/"
            className="bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
          >
            Explore Recommended Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link
              to={`/booking-confirmation/${booking._id}`}
              key={booking._id}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brand-red/30 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
            >
              {/* Left: Movie & Cinema Info */}
              <div className="flex gap-4 items-center">
                <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden border border-white/5 shrink-0">
                  <img src={booking.movie?.poster} alt={booking.movie?.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-base md:text-lg group-hover:text-brand-red transition line-clamp-1">
                    {booking.movie?.title}
                  </h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <Film className="h-3 w-3 text-slate-500" />
                    {booking.cinema?.name}
                  </p>
                  <p className="text-slate-500 text-[10px] flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {booking.cinema?.city}
                  </p>
                </div>
              </div>

              {/* Middle: Showtime and Seats */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-brand-red" />
                  {new Date(booking.show?.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-brand-red" />
                  {booking.show?.time}
                </div>
                <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] text-slate-400">
                  Seats: <span className="text-white font-extrabold">{booking.seats?.join(', ')}</span>
                </div>
              </div>

              {/* Right: Code, Price, Arrow */}
              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold mb-0.5">Reference ID</span>
                  <span className="text-slate-200 text-xs font-bold tracking-wider">{booking.bookingCode}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold mb-0.5">Paid</span>
                    <span className="text-brand-red text-sm font-black">₹{booking.totalPrice}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-brand-red group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
