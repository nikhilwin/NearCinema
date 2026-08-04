import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  seats: { type: [String], required: true },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, default: 'paid' }, // paid, pending
  bookingCode: { type: String, required: true } // e.g. "NC-3498A"
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);
