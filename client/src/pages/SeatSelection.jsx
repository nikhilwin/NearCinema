import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PaymentModal from '../components/PaymentModal';
import { Armchair, Calendar, Clock, Film, MapPin, ChevronLeft, CreditCard } from 'lucide-react';

const SeatSelection = ({ user }) => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Seat Configuration
  const rows = [
    { name: 'A', tier: 'Gold', premium: 50 },
    { name: 'B', tier: 'Gold', premium: 50 },
    { name: 'C', tier: 'Premium', premium: 0 },
    { name: 'D', tier: 'Premium', premium: 0 },
    { name: 'E', tier: 'Premium', premium: 0 },
    { name: 'F', tier: 'Classic', premium: -30 },
    { name: 'G', tier: 'Classic', premium: -30 }
  ];
  const seatsPerRow = 10;

  useEffect(() => {
    const fetchShow = async () => {
      setLoading(true);
      try {
        const data = await api.getShowById(showId);
        setShow(data);
      } catch (err) {
        console.error("Error fetching show:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShow();
  }, [showId]);

  if (loading || !show) {
    return (
      <div className="container mx-auto px-6 py-12 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-red"></div>
      </div>
    );
  }

  const getSeatPrice = (rowConfig) => {
    return show.price + rowConfig.premium;
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatCode) => {
      const rowName = seatCode.charAt(0);
      const rowConfig = rows.find(r => r.name === rowName);
      return total + getSeatPrice(rowConfig);
    }, 0);
  };

  const handleSeatClick = (rowConfig, seatNum) => {
    const seatCode = `${rowConfig.name}${seatNum}`;
    
    // Check if already booked
    if (show.bookedSeats.includes(seatCode)) return;

    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatCode));
    } else {
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    if (!user) {
      alert("Please sign in to proceed with booking.");
      navigate('/login');
      return;
    }

    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const response = await api.createBooking(showId, selectedSeats);
      setPaymentModalOpen(false);
      navigate(`/booking-confirmation/${response.booking._id}`);
    } catch (err) {
      alert(err.message || "Failed to finalize booking.");
      setPaymentModalOpen(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 flex flex-col items-center">
      {/* Header back button */}
      <div className="w-full flex items-center justify-between mb-8 border-b border-white/5 pb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          Back to showtimes
        </button>

        {/* Selected Movie/Cinema Summary */}
        <div className="text-right">
          <h2 className="font-extrabold text-white text-base md:text-lg">{show.movie?.title}</h2>
          <p className="text-slate-400 text-xs flex items-center gap-1 justify-end mt-0.5">
            <Film className="h-3 w-3 text-brand-red" />
            {show.cinema?.name}
          </p>
        </div>
      </div>

      {/* Show Details bar */}
      <div className="glass-panel w-full max-w-4xl p-4 rounded-2xl flex flex-wrap justify-around items-center gap-4 text-xs font-bold text-slate-300 border border-white/5 mb-12">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-brand-red" />
          {new Date(show.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-brand-red" />
          {show.time}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-brand-red" />
          {show.cinema?.city}
        </span>
      </div>

      {/* Seating Layout Canvas */}
      <div className="w-full max-w-4xl flex flex-col items-center overflow-x-auto pb-6">
        
        {/* Screen Indicator */}
        <div className="w-[300px] md:w-[600px] mb-12 text-center">
          <div className="screen-glow h-4 w-full rounded-b-[40px] mb-2"></div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cinema Screen (This Way Face)</span>
        </div>

        {/* Rows Grid */}
        <div className="space-y-4 min-w-[500px]">
          {rows.map((row) => (
            <div key={row.name} className="flex items-center justify-between gap-4">
              {/* Row Label Left */}
              <span className="text-slate-500 font-extrabold text-sm w-4 text-center">{row.name}</span>
              
              {/* Row Seats */}
              <div className="flex gap-2">
                {[...Array(seatsPerRow)].map((_, i) => {
                  const seatNum = i + 1;
                  const seatCode = `${row.name}${seatNum}`;
                  const isBooked = show.bookedSeats.includes(seatCode);
                  const isSelected = selectedSeats.includes(seatCode);

                  let seatClass = 'seat-available';
                  if (isBooked) seatClass = 'seat-booked';
                  else if (isSelected) seatClass = 'seat-selected';

                  return (
                    <button
                      key={seatCode}
                      disabled={isBooked}
                      onClick={() => handleSeatClick(row, seatNum)}
                      className={`seat w-7 md:w-8 text-[10px] font-bold text-white flex items-center justify-center cursor-pointer ${seatClass}`}
                      title={`${row.tier} Seat ${seatCode} - ₹${getSeatPrice(row)}`}
                    >
                      {seatNum}
                    </button>
                  );
                })}
              </div>

              {/* Row Label Right + Price Tag */}
              <div className="w-20 flex justify-end items-center gap-1 text-[10px] text-slate-500 font-bold">
                <span className="bg-slate-900 border border-white/5 px-2 py-0.5 rounded text-[8px] text-brand-red">
                  ₹{getSeatPrice(row)}
                </span>
                <span>{row.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-12 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="seat w-5 bg-slate-800 border border-white/10 rounded-sm"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="seat w-5 bg-brand-red rounded-sm shadow-md shadow-brand-red/30"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="seat w-5 bg-slate-900 border border-white/5 opacity-40 rounded-sm"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Summary Floating Footer */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-glass backdrop-blur-md border-t border-white/5 p-5 flex flex-col md:flex-row justify-between items-center gap-4 container mx-auto rounded-t-3xl max-w-5xl">
          <div className="flex items-start gap-4">
            <div className="bg-brand-red/10 p-2.5 rounded-xl">
              <Armchair className="h-6 w-6 text-brand-red" />
            </div>
            <div>
              <span className="text-slate-400 text-xs block font-bold uppercase">Selected Seats ({selectedSeats.length})</span>
              <span className="text-white text-base font-black tracking-wide">{selectedSeats.sort().join(', ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="text-slate-400 text-xs block font-bold uppercase">Estimated Subtotal</span>
              <span className="text-white text-xl font-black text-gradient">₹{calculateTotal()}</span>
            </div>
            <button
              onClick={handleProceed}
              className="bg-brand-red hover:bg-brand-red-hover active:scale-95 text-white font-extrabold px-6 py-3 rounded-xl transition shadow-lg shadow-brand-red/20 text-sm flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="h-4.5 w-4.5" />
              Book Tickets
            </button>
          </div>
        </div>
      )}

      {/* Secure Checkout Dialog */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        totalAmount={calculateTotal()}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default SeatSelection;
