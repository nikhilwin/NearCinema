import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, MapPin, User, LogOut, Search, Compass } from 'lucide-react';

const Navbar = ({
  user,
  onLogout,
  selectedCity,
  setSelectedCity,
  userLocation,
  setUserLocation,
  searchQuery,
  setSearchQuery
}) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const cities = ["Varanasi", "Delhi", "Mumbai", "Bengaluru"];

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setSelectedCity(""); // Clear city filter to prioritize coordinates
        setLocating(false);
        navigate('/');
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve location. Please choose a city manually.");
        setLocating(false);
      }
    );
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setUserLocation(null); // Clear coordinates to prioritize city
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-brand-glass backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-brand-red p-2 rounded-xl group-hover:scale-110 transition-all duration-300">
          <Film className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-wider text-gradient text-glow">
          NearCinema
        </span>
      </Link>

      {/* Search Bar */}
      <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-white/10 rounded-full px-4 py-2 w-96 focus-within:border-brand-red focus-within:ring-1 focus-within:ring-brand-red transition-all">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search movies, genres..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full text-sm"
        />
      </div>

      {/* Location & User Options */}
      <div className="flex items-center gap-4">
        {/* Geolocation Button */}
        <button
          onClick={handleDetectLocation}
          disabled={locating}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            userLocation
              ? 'bg-brand-red/10 border-brand-red/30 text-brand-red'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
          }`}
          title="Detect near cinemas using browser GPS"
        >
          <Compass className={`h-4 w-4 ${locating ? 'animate-spin' : ''}`} />
          {locating ? "Locating..." : userLocation ? "GPS Active" : "Detect GPS"}
        </button>

        {/* City Dropdown Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5">
          <MapPin className="h-4 w-4 text-brand-red" />
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="bg-transparent border-none outline-none text-slate-200 text-xs font-semibold cursor-pointer"
          >
            <option value="" className="bg-brand-dark">Choose City</option>
            {cities.map(city => (
              <option key={city} value={city} className="bg-brand-dark">{city}</option>
            ))}
          </select>
        </div>

        {/* User Account Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-white/10 px-4 py-1.5 rounded-full text-sm text-slate-200 cursor-pointer"
            >
              <User className="h-4 w-4 text-brand-red" />
              <span>{user.name}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl py-2 z-50">
                <Link
                  to="/bookings"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-300 hover:bg-brand-red/10 hover:text-white"
                >
                  My Bookings
                </Link>
                <hr className="border-white/5 my-1" />
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-brand-red hover:bg-brand-red-hover text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
