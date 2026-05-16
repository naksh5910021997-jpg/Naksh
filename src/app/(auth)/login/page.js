'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
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

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Force refresh ya window location use karein taake Navbar state update ho jaye
        window.location.href = data.user.role === 'admin' ? '/admin' : '/';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Background matched to your preference #f8fafc
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 font-sans">
      <div className="max-w-[400px] w-full">

        {/* Editorial Logo Style */}
        <div className="text-center mb-12">
          <Link href="/" className="text-3xl font-black uppercase tracking-[0.3em] text-black">
            Naksh<span className="text-gray-400">.</span>
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-4 font-bold">
            Authentication Portal
          </p>
        </div>

        {/* Clean, Flat Login Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-8 tracking-tight">Login</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-widest p-4 rounded-lg mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] uppercase tracking-[0.15em] font-black text-slate-400">
                  Password
                </label>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all duration-300 disabled:opacity-50 mt-4"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-50 text-center">
            <p className="text-slate-500 text-xs">
              New to Naksh?{' '}
              <Link href="/signup" className="text-black font-black uppercase tracking-tighter hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Minimal Footer Link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-black transition">
            ← Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}