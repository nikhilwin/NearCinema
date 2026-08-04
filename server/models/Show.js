import mongoose from 'mongoose';

const ShowSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
  time: { type: String, required: true }, // e.g. "7:30 PM"
  date: { type: String, required: true }, // YYYY-MM-DD
  price: { type: Number, required: true },
  bookedSeats: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Show', ShowSchema);
