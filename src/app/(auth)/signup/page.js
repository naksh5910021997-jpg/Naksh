'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-16 font-sans">
      <div className="max-w-[450px] w-full">

        {/* Editorial Logo Style */}
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black uppercase tracking-[0.3em] text-black">
            Naksh<span className="text-gray-400">.</span>
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-4 font-bold">
            Create Your Account
          </p>
        </div>

        {/* Clean, Compact Signup Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-8 tracking-tight">Sign Up</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-widest p-4 rounded-xl mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-black text-slate-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-black text-slate-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                placeholder="name@example.com"
              />
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-black text-slate-400 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-black text-slate-400 mb-2">
                  Confirm
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all duration-300 disabled:opacity-50 mt-4 shadow-lg shadow-black/5"
            >
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-50 text-center">
            <p className="text-slate-500 text-xs">
              Already a member?{' '}
              <Link href="/login" className="text-black font-black uppercase tracking-tighter hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Minimal Footer Link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-black transition">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}