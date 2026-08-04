import { Cinema } from '../config/db.js';

// Haversine formula to calculate distance between two coordinates in km
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getCinemas = async (req, res) => {
  const { city, latitude, longitude, radius } = req.query;

  try {
    let query = {};
    if (city) {
      query.city = { $regex: new RegExp(city, 'i') }; // Case insensitive search
    }

    let cinemas = await Cinema.find(city ? { city } : {}); // fallback simple match for JSON db

    // If using JSON database, Mongoose regex won't run natively, so we filter manually
    if (city) {
      cinemas = cinemas.filter(c => c.city.toLowerCase() === city.toLowerCase());
    }

    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      const maxDistance = parseFloat(radius) || 20; // default 20km radius

      // Calculate distance for all cinemas and filter/sort
      const cinemasWithDistance = cinemas
        .map(cinema => {
          // In JSON db, cinema is plain object, in Mongoose it's document; convert to plain obj if needed
          const cinemaObj = cinema.toObject ? cinema.toObject() : cinema;
          const dist = getDistance(userLat, userLon, cinema.latitude, cinema.longitude);
          return { ...cinemaObj, distance: Math.round(dist * 10) / 10 }; // round to 1 decimal place
        })
        .filter(cinema => cinema.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);

      return res.json(cinemasWithDistance);
    }

    res.json(cinemas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching cinemas' });
  }
};

export const getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({ message: 'Cinema not found' });
    }
    res.json(cinema);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching cinema details' });
  }
};
