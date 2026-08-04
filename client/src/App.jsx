import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './services/api';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import CinemaDetails from './pages/CinemaDetails';
import SeatSelection from './pages/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Search and Location States
  const [selectedCity, setSelectedCity] = useState('Varanasi');
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch current user if token exists on load
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch (err) {
          console.error("Session expired:", err.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar
          user={user}
          onLogout={handleLogout}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <main className="flex-grow">
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  selectedCity={selectedCity} 
                  userLocation={userLocation} 
                  searchQuery={searchQuery} 
                />
              } 
            />
            
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />
              } 
            />
            
            <Route 
              path="/register" 
              element={
                user ? <Navigate to="/" /> : <Register onLoginSuccess={handleLoginSuccess} />
              } 
            />
            
            <Route path="/movie/:id" element={<MovieDetails />} />
            
            <Route path="/cinema/:id" element={<CinemaDetails />} />
            
            <Route 
              path="/select-seats/:showId" 
              element={<SeatSelection user={user} />} 
            />
            
            <Route 
              path="/booking-confirmation/:bookingId" 
              element={
                user ? <BookingConfirmation /> : <Navigate to="/login" />
              } 
            />
            
            <Route 
              path="/bookings" 
              element={
                user ? <MyBookings user={user} /> : <Navigate to="/login" />
              } 
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-600 font-bold bg-slate-950/20">
          <p>© {new Date().getFullYear()} NearCinema. Built with Express, React & Tailwind v4.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
