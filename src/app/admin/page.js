'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    tshirtProducts: 0,
    trouserProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    totalCategories: 0,
  });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [pRes, cRes, mRes] = await Promise.all([
          fetch('/api/admin/products?limit=1000', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/categories'),
          fetch('/api/contact', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        const pData = await pRes.json();
        const cData = await cRes.json();
        const mData = await mRes.json().catch(() => ({}));
        if (mData.success) setMessages(mData.data);

        if (pData.success) {
          setStats({
            totalProducts: pData.data.length,
            tshirtProducts: pData.data.filter(p => !p.garmentType || p.garmentType === 'tshirt').length,
            trouserProducts: pData.data.filter(p => p.garmentType === 'trouser').length,
            activeProducts: pData.data.filter(p => p.status === 'active').length,
            draftProducts: pData.data.filter(p => p.status === 'draft').length,
            totalCategories: cData.success ? cData.data.length : 0,
          });
        }
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const unreadMessages = messages.filter(m => !m.read).length;

  if (loading) return <div className="h-96 flex items-center justify-center"><div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin"></div></div>;

  return (
    <div className="space-y-16 px-4">
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic">Shop View</h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Metrics & System Integrity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-px bg-black/5 border border-black/5">
        {[
          { label: 'Total units', val: stats.totalProducts, link: '/admin/products' },
          { label: 'T-Shirts', val: stats.tshirtProducts, link: '/admin/products?garmentType=tshirt' },
          { label: 'Trousers', val: stats.trouserProducts, link: '/admin/products?garmentType=trouser' },
          { label: 'Market Live', val: stats.activeProducts, link: '/admin/products' },
          { label: 'Drafts', val: stats.draftProducts, link: '/admin/products' },
          { label: 'Collections', val: stats.totalCategories, link: '/admin/categories' },
          { label: 'Messages', val: messages.length, link: '/admin/messages', note: unreadMessages > 0 ? `${unreadMessages} new` : null }
        ].map((s, i) => (
          <Link key={i} href={s.link} className="bg-white p-8 hover:bg-[#fafafa] transition-colors group">
            <p className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400 mb-8 group-hover:text-black transition-colors">{s.label}</p>
            <p className="text-5xl font-black tracking-tighter">{s.val}</p>
            {s.note && <p className="text-[9px] uppercase tracking-widest font-black text-red-500 mt-3">{s.note}</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-[10px] uppercase tracking-[0.5em] font-black border-b border-black pb-4">Quick Commands</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/products/add?garmentType=tshirt" className="p-8 border border-black flex justify-between items-center group hover:bg-black hover:text-white transition-all duration-500">
              <span className="text-xs font-black uppercase tracking-[0.2em]">Add T-Shirt</span>
              <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
            </Link>
            <Link href="/admin/products/add?garmentType=trouser" className="p-8 border border-black flex justify-between items-center group hover:bg-black hover:text-white transition-all duration-500">
              <span className="text-xs font-black uppercase tracking-[0.2em]">Add Trouser</span>
              <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
            </Link>
            <Link href="/admin/products" className="p-8 border border-black/10 flex justify-between items-center group hover:border-black transition-all">
              <span className="text-xs font-black uppercase tracking-[0.2em]">Audit Catalog</span>
              <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
            </Link>
            <Link href="/admin/messages" className="p-8 border border-black/10 flex justify-between items-center group hover:border-black transition-all">
              <span className="text-xs font-black uppercase tracking-[0.2em]">View Messages{unreadMessages > 0 && ` (${unreadMessages} new)`}</span>
              <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>

          <h2 className="text-[10px] uppercase tracking-[0.5em] font-black border-b border-black pb-4 pt-6">Recent Messages</h2>
          {messages.length === 0 ? (
            <p className="text-xs text-gray-400 uppercase tracking-widest">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {messages.slice(0, 3).map(m => (
                <Link key={m._id} href="/admin/messages" className={`block bg-white p-5 border hover:border-black transition-all ${m.read ? 'border-black/5' : 'border-black border-l-4'}`}>
                  <div className="flex justify-between gap-4 mb-1">
                    <span className="text-xs font-black uppercase tracking-tight truncate">
                      {!m.read && <span className="text-[8px] bg-black text-white px-2 py-0.5 tracking-widest mr-2">New</span>}
                      {m.subject || 'No subject'}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest shrink-0">{new Date(m.createdAt).toLocaleDateString('en-PK')}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{m.name} — {m.message}</p>
                </Link>
              ))}
            </div>
          )}
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
