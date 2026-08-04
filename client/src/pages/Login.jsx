import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Film, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      onLoginSuccess(data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-height-screen py-16 px-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-red/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-red p-3 rounded-2xl mb-4 glow-crimson">
            <Film className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white text-glow mb-1">Welcome Back</h2>
          <p className="text-slate-400 text-sm">Sign in to book your movie tickets</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl mb-6 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-xs font-bold mb-2 uppercase tracking-wider">
              Email Address
            </label>
            <div className="flex items-center bg-slate-900 border border-white/5 focus-within:border-brand-red focus-within:ring-1 focus-within:ring-brand-red rounded-xl px-4 py-3 gap-3 transition">
              <Mail className="h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-200 w-full text-sm placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-bold mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="flex items-center bg-slate-900 border border-white/5 focus-within:border-brand-red focus-within:ring-1 focus-within:ring-brand-red rounded-xl px-4 py-3 gap-3 transition">
              <Lock className="h-5 w-5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-200 w-full text-sm placeholder-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-red hover:bg-brand-red-hover active:scale-95 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-brand-red/20 flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-red hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
