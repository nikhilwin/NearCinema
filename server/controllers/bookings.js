import { Booking, Show, Movie, Cinema } from '../config/db.js';
import nodemailer from 'nodemailer';

// Helper to generate a unique booking reference
const generateBookingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'NC-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Get shows by Movie or Cinema
export const getShows = async (req, res) => {
  const { movieId, cinemaId, date } = req.query;

  try {
    let query = {};
    if (movieId) query.movieId = movieId;
    if (cinemaId) query.cinemaId = cinemaId;
    if (date) query.date = date;

    const shows = await Show.find(query);

    // Resolve Movie and Cinema details manually for compatibility
    const detailedShows = [];
    for (const show of shows) {
      const showObj = show.toObject ? show.toObject() : show;
      const movie = await Movie.findById(show.movieId);
      const cinema = await Cinema.findById(show.cinemaId);

      detailedShows.push({
        ...showObj,
        movie: movie ? (movie.toObject ? movie.toObject() : movie) : null,
        cinema: cinema ? (cinema.toObject ? cinema.toObject() : cinema) : null
      });
    }

    res.json(detailedShows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching shows' });
  }
};

// Get show details by ID (including movie and cinema details)
export const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    const showObj = show.toObject ? show.toObject() : show;
    const movie = await Movie.findById(show.movieId);
    const cinema = await Cinema.findById(show.cinemaId);

    res.json({
      ...showObj,
      movie: movie ? (movie.toObject ? movie.toObject() : movie) : null,
      cinema: cinema ? (cinema.toObject ? cinema.toObject() : cinema) : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching show details' });
  }
};

// Create a booking
export const createBooking = async (req, res) => {
  const { showId, seats } = req.body;
  const userId = req.user.id;

  try {
    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'Invalid booking request data' });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    // Check if seats are already booked
    const alreadyBooked = seats.some(seat => show.bookedSeats.includes(seat));
    if (alreadyBooked) {
      return res.status(400).json({ message: 'One or more selected seats are already booked' });
    }

    // Calculate total price
    const totalPrice = show.price * seats.length;
    const bookingCode = generateBookingCode();

    // Create the booking
    const booking = await Booking.create({
      userId,
      showId,
      seats,
      totalPrice,
      paymentStatus: 'paid',
      bookingCode
    });

    // Update show's booked seats list
    const updatedBookedSeats = [...show.bookedSeats, ...seats];
    await Show.findByIdAndUpdate(showId, {
      $set: { bookedSeats: updatedBookedSeats }
    });

    // Populate details to send confirmation
    const movie = await Movie.findById(show.movieId);
    const cinema = await Cinema.findById(show.cinemaId);

    // Mock Send Email (using nodemailer console fallback or Ethereal for dev)
    console.log(`Booking Confirmation Email sent to User ${userId} for Booking ${bookingCode}`);

    res.status(201).json({
      success: true,
      booking: {
        ...booking.toObject ? booking.toObject() : booking,
        show: show.toObject ? show.toObject() : show,
        movie: movie ? (movie.toObject ? movie.toObject() : movie) : null,
        cinema: cinema ? (cinema.toObject ? cinema.toObject() : cinema) : null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating booking' });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id });

    const detailedBookings = [];
    for (const booking of bookings) {
      const bookingObj = booking.toObject ? booking.toObject() : booking;
      const show = await Show.findById(booking.showId);

      let movie = null;
      let cinema = null;

      if (show) {
        movie = await Movie.findById(show.movieId);
        cinema = await Cinema.findById(show.cinemaId);
      }

      detailedBookings.push({
        ...bookingObj,
        show: show ? (show.toObject ? show.toObject() : show) : null,
        movie: movie ? (movie.toObject ? movie.toObject() : movie) : null,
        cinema: cinema ? (cinema.toObject ? cinema.toObject() : cinema) : null
      });
    }

    res.json(detailedBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving bookings' });
  }
};

// Get booking details by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization check
    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this booking' });
    }

    const bookingObj = booking.toObject ? booking.toObject() : booking;
    const show = await Show.findById(booking.showId);
    let movie = null;
    let cinema = null;

    if (show) {
      movie = await Movie.findById(show.movieId);
      cinema = await Cinema.findById(show.cinemaId);
    }

    res.json({
      ...bookingObj,
      show: show ? (show.toObject ? show.toObject() : show) : null,
      movie: movie ? (movie.toObject ? movie.toObject() : movie) : null,
      cinema: cinema ? (cinema.toObject ? cinema.toObject() : cinema) : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching booking details' });
  }
};
