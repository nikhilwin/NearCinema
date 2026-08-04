const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Auth
  register: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Cinemas
  getCinemas: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.city) query.append('city', params.city);
    if (params.latitude) query.append('latitude', params.latitude);
    if (params.longitude) query.append('longitude', params.longitude);
    if (params.radius) query.append('radius', params.radius);

    const res = await fetch(`${BASE_URL}/cinemas?${query.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getCinemaById: async (id) => {
    const res = await fetch(`${BASE_URL}/cinemas/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Movies
  getMovies: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${BASE_URL}/movies${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getMovieById: async (id) => {
    const res = await fetch(`${BASE_URL}/movies/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Shows
  getShows: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.movieId) query.append('movieId', params.movieId);
    if (params.cinemaId) query.append('cinemaId', params.cinemaId);
    if (params.date) query.append('date', params.date);

    const res = await fetch(`${BASE_URL}/shows?${query.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getShowById: async (id) => {
    const res = await fetch(`${BASE_URL}/shows/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Bookings
  createBooking: async (showId, seats) => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ showId, seats }),
    });
    return handleResponse(res);
  },

  getUserBookings: async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getBookingById: async (id) => {
    const res = await fetch(`${BASE_URL}/bookings/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Payments
  createPaymentOrder: async (amount) => {
    const res = await fetch(`${BASE_URL}/payment/order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    });
    return handleResponse(res);
  },

  verifyPaymentSignature: async (paymentDetails) => {
    const res = await fetch(`${BASE_URL}/payment/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentDetails),
    });
    return handleResponse(res);
  },
};
