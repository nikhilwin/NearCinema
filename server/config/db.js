import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  UserJson,
  CinemaJson,
  MovieJson,
  ShowJson,
  BookingJson
} from './jsonDb.js';

import UserModel from '../models/User.js';
import CinemaModel from '../models/Cinema.js';
import MovieModel from '../models/Movie.js';
import ShowModel from '../models/Show.js';
import BookingModel from '../models/Booking.js';

dotenv.config();

const useMongo = !!process.env.MONGODB_URI;

export const connectDB = async () => {
  if (useMongo) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB Connected successfully!');
    } catch (err) {
      console.error('MongoDB Connection Error:', err.message);
      process.exit(1);
    }
  } else {
    console.log('Running in Local JSON Database Mode. Files stored in /server/data/');
  }
};

// Export appropriate model based on configuration
export const User = useMongo ? UserModel : UserJson;
export const Cinema = useMongo ? CinemaModel : CinemaJson;
export const Movie = useMongo ? MovieModel : MovieJson;
export const Show = useMongo ? ShowModel : ShowJson;
export const Booking = useMongo ? BookingModel : BookingJson;
export const isMongoMode = useMongo;
