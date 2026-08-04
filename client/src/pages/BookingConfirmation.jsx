import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CheckCircle, Calendar, Clock, Film, MapPin, Printer, ArrowRight, Ticket } from 'lucide-react';

const BookingConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const data = await api.getBookingById(id);
        setBooking(data);
      } catch (err) {
        console.error("Error fetching booking details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading || !booking) {
    return (
      <div className="container mx-auto px-6 py-12 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-red"></div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col items-center max-w-2xl space-y-8">
      {/* Success banner */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-full shadow-lg shadow-emerald-500/10">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-black text-white text-glow">Booking Confirmed!</h1>
        <p className="text-slate-400 text-sm">Your seats are secured. Show this QR code at the hall entry.</p>
      </div>

      {/* Ticket Layout Card */}
      <div className="w-full glass-panel rounded-3xl overflow-hidden border border-white/5 relative shadow-2xl print:border-slate-300 print:text-black">
        {/* Glow behind ticket */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-brand-red/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl"></div>

        {/* Top Segment: Movie & Cinema info */}
        <div className="p-6 md:p-8 flex gap-6 border-b border-dashed border-white/10 relative print:border-slate-300">
          {/* Movie poster left */}
          <div className="w-20 md:w-24 aspect-[2/3] rounded-xl overflow-hidden border border-white/5 shrink-0">
            <img src={booking.movie?.poster} alt={booking.movie?.title} className="w-full h-full object-cover" />
          </div>

          {/* Details right */}
          <div className="flex-grow space-y-3">
            <h2 className="text-xl md:text-2xl font-black text-white">{booking.movie?.title}</h2>
            
            <p className="text-slate-300 font-bold text-xs md:text-sm flex items-center gap-1.5">
              <Film className="h-4 w-4 text-brand-red" />
              {booking.cinema?.name}
            </p>
            <p className="text-slate-500 text-xs flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {booking.cinema?.city}
            </p>
          </div>
        </div>

        {/* Middle Segment: Date, Time, Seats details */}
        <div className="p-6 md:p-8 grid grid-cols-2 gap-y-4 md:grid-cols-4 border-b border-dashed border-white/10 relative print:border-slate-300">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Show Date</span>
            <span className="text-white text-xs md:text-sm font-extrabold flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-red" />
              {new Date(booking.show?.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Show Time</span>
            <span className="text-white text-xs md:text-sm font-extrabold flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-red" />
              {booking.show?.time}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Seats Selected</span>
            <span className="text-white text-xs md:text-sm font-extrabold flex items-center gap-1.5">
              <Ticket className="h-4 w-4 text-brand-red" />
              {booking.seats?.join(', ')}
            </span>
          </div>

          <div className="text-right md:text-left">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Amount Paid</span>
            <span className="text-brand-red text-xs md:text-sm font-black">₹{booking.totalPrice}</span>
          </div>
        </div>

        {/* Bottom Segment: QR Code & Reference Code */}
        <div className="p-6 md:p-8 bg-slate-950/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Booking Reference ID</span>
            <span className="text-xl md:text-2xl font-black tracking-widest text-white">{booking.bookingCode}</span>
            <p className="text-[10px] text-slate-500 font-semibold">Payment processed and logged securely via NearCinema Gateway.</p>
          </div>

          {/* SVG QR Code */}
          <div className="bg-white p-3 rounded-2xl shrink-0 shadow-lg relative group">
            <svg 
              width="100" 
              height="100" 
              viewBox="0 0 100 100" 
              className="text-black fill-current"
            >
              {/* Top-left anchor box */}
              <rect x="0" y="0" width="25" height="25" />
              <rect x="5" y="5" width="15" height="15" fill="white" />
              <rect x="9" y="9" width="7" height="7" />

              {/* Top-right anchor box */}
              <rect x="75" y="0" width="25" height="25" />
              <rect x="80" y="5" width="15" height="15" fill="white" />
              <rect x="84" y="9" width="7" height="7" />

              {/* Bottom-left anchor box */}
              <rect x="0" y="75" width="25" height="25" />
              <rect x="5" y="80" width="15" height="15" fill="white" />
              <rect x="9" y="84" width="7" height="7" />

              {/* Random blocks simulation */}
              <rect x="35" y="5" width="10" height="5" />
              <rect x="50" y="0" width="5" height="15" />
              <rect x="60" y="10" width="10" height="5" />
              <rect x="35" y="20" width="5" height="15" />
              
              <rect x="5" y="35" width="15" height="5" />
              <rect x="0" y="50" width="10" height="10" />
              <rect x="20" y="55" width="15" height="5" />
              
              <rect x="40" y="40" width="20" height="20" />
              <rect x="45" y="45" width="10" height="10" fill="white" />
              
              <rect x="70" y="35" width="5" height="15" />
              <rect x="85" y="40" width="15" height="5" />
              <rect x="80" y="55" width="10" height="10" />
              
              <rect x="35" y="70" width="15" height="5" />
              <rect x="40" y="80" width="5" height="15" />
              <rect x="55" y="75" width="15" height="20" />
              <rect x="60" y="80" width="5" height="10" fill="white" />
              
              <rect x="75" y="75" width="5" height="5" />
              <rect x="85" y="80" width="10" height="5" />
              <rect x="90" y="90" width="10" height="10" />
            </svg>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 w-full">
        <button
          onClick={handlePrint}
          className="flex-1 bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 hover:text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="h-5 w-5" />
          Print Ticket
        </button>

        <Link
          to="/"
          className="flex-1 bg-brand-red hover:bg-brand-red-hover text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-red/25"
        >
          Browse Movies
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmation;
