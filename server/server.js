import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, Movie, Cinema, Show } from './config/db.js';
import { mockMovies, mockCinemas } from './config/seedData.js';

// Route imports
import { register, login, getMe } from './controllers/auth.js';
import { protect } from './middleware/auth.js';
import { getCinemas, getCinemaById } from './controllers/cinemas.js';
import { getMovies, getMovieById } from './controllers/movies.js';
import { getShows, getShowById, createBooking, getUserBookings, getBookingById } from './controllers/bookings.js';
import { createOrder, verifyPayment } from './controllers/payment.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', protect, getMe);

app.post('/api/payment/order', protect, createOrder);
app.post('/api/payment/verify', protect, verifyPayment);

app.get('/api/cinemas', getCinemas);
app.get('/api/cinemas/:id', getCinemaById);

app.get('/api/movies', getMovies);
app.get('/api/movies/:id', getMovieById);

app.get('/api/shows', getShows);
app.get('/api/shows/:id', getShowById);

app.post('/api/bookings', protect, createBooking);
app.get('/api/bookings', protect, getUserBookings);
app.get('/api/bookings/:id', protect, getBookingById);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Seed function to pre-populate database dynamically
const seedDatabase = async () => {
  try {
    const existingMovies = await Movie.find({});
    const existingCinemas = await Cinema.find({});

    if (existingMovies.length === 0 && existingCinemas.length === 0) {
      console.log('Seeding movies and cinemas...');
      
      const createdMovies = [];
      for (const m of mockMovies) {
        const doc = await Movie.create(m);
        createdMovies.push(doc);
      }

      const createdCinemas = [];
      for (const c of mockCinemas) {
        const doc = await Cinema.create(c);
        createdCinemas.push(doc);
      }

      console.log(`Seeded ${createdMovies.length} movies and ${createdCinemas.length} cinemas.`);

      // Seed Shows dynamically for Today, Tomorrow, and Day After Tomorrow
      console.log('Generating dynamic showtimes for the next 3 days...');
      const times = ["10:30 AM", "2:00 PM", "5:30 PM", "8:45 PM"];
      const prices = [180, 220, 250, 300];
      
      const today = new Date();
      const dates = [];
      for (let i = 0; i < 3; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }

      let showCount = 0;
      for (const cinema of createdCinemas) {
        // Map movies to cinemas: play 3 movies per cinema to keep it diverse
        const cinemaMovies = createdMovies.slice(0, 3); 
        for (const movie of cinemaMovies) {
          for (const date of dates) {
            // Give each movie 2 showtimes per day at this cinema
            const showTimes = times.slice(0, 2); // e.g. Morning and Afternoon
            for (let tIdx = 0; tIdx < showTimes.length; tIdx++) {
              await Show.create({
                movieId: movie._id,
                cinemaId: cinema._id,
                time: showTimes[tIdx],
                date,
                price: prices[Math.floor(Math.random() * prices.length)],
                bookedSeats: []
              });
              showCount++;
            }
          }
        }
      }
      console.log(`Successfully seeded ${showCount} shows.`);
    } else {
      console.log('Database already has data. Skipping seeder...');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
