import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  poster: { type: String, required: true }, // URL or Base64
  duration: { type: String, required: true }, // e.g. "2h 45m"
  genre: { type: String, required: true },
  rating: { type: Number, default: 0 },
  description: { type: String, default: '' },
  language: { type: String, default: 'English' }
}, { timestamps: true });

export default mongoose.model('Movie', MovieSchema);
