'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0, draftProducts: 0, totalCategories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [pRes, cRes] = await Promise.all([
          fetch('/api/admin/products?limit=1000', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/categories')
        ]);
        const pData = await pRes.json();
        const cData = await cRes.json();

        if (pData.success) {
          setStats({
            totalProducts: pData.data.length,
            activeProducts: pData.data.filter(p => p.status === 'active').length,
            draftProducts: pData.data.filter(p => p.status === 'draft').length,
            totalCategories: cData.success ? cData.data.length : 0,
          });
        }
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center"><div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin"></div></div>;

  return (
    <div className="space-y-16 px-4">
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic">Studio View</h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Metrics & System Integrity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-black/5 border border-black/5">
        {[
          { label: 'Total units', val: stats.totalProducts, link: '/admin/products' },
          { label: 'Market Live', val: stats.activeProducts, link: '/admin/products' },
          { label: 'Drafts', val: stats.draftProducts, link: '/admin/products' },
          { label: 'Collections', val: stats.totalCategories, link: '/admin/categories' }
        ].map((s, i) => (
          <Link key={i} href={s.link} className="bg-white p-10 hover:bg-[#fafafa] transition-colors group">
            <p className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400 mb-8 group-hover:text-black transition-colors">{s.label}</p>
            <p className="text-5xl font-black tracking-tighter">{s.val}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-[10px] uppercase tracking-[0.5em] font-black border-b border-black pb-4">Quick Commands</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/products/add" className="p-8 border border-black flex justify-between items-center group hover:bg-black hover:text-white transition-all duration-500">
              <span className="text-xs font-black uppercase tracking-[0.2em]">Add New Item</span>
              <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
            </Link>
            <Link href="/admin/products" className="p-8 border border-black/10 flex justify-between items-center group hover:border-black transition-all">
              <span className="text-xs font-black uppercase tracking-[0.2em]">Audit Catalog</span>
              <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>
        </div>
        <div className="bg-black p-10 text-white flex flex-col justify-between aspect-square lg:aspect-auto">
          <p className="text-[9px] uppercase tracking-[0.4em] opacity-40">Operational Status</p>
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] uppercase tracking-widest border-b border-white/10 pb-2"><span>Network</span><span className="text-emerald-400">Stable</span></div>
            <div className="flex justify-between text-[10px] uppercase tracking-widest border-b border-white/10 pb-2"><span>Sync</span><span className="text-emerald-400">Online</span></div>
          </div>
          <p className="text-[8px] opacity-20 uppercase tracking-widest">Naksh Admin v2.0</p>
        </div>
      </div>
    </div>
  );
}