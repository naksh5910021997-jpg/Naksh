'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Box, Layers, LogOut, Menu, X, ExternalLink } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { router.push('/login'); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') { router.push('/'); return; }
    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Inventory', icon: Box },
    { href: '/admin/categories', label: 'Collections', icon: Layers },
  ];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin"></div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc] flex font-sans text-black">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`fixed inset-y-0 left-0 z-[70] bg-white border-r border-black/5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          flex flex-col
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isSidebarHovered ? 'md:w-64' : 'md:w-[70px]'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-[22px] border-b border-black/5 shrink-0">
          <div className="w-6 h-6 bg-black flex-shrink-0"></div>
          <span className={`ml-6 font-black uppercase tracking-[0.3em] text-[12px] whitespace-nowrap transition-opacity duration-300 ${isSidebarHovered || isMobileOpen ? 'opacity-100' : 'opacity-0'}`}>
            Naksh<span className="text-gray-300">.</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-8 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="group flex items-center h-14 relative">
                <div className={`w-[70px] flex-shrink-0 flex items-center justify-center transition-colors ${isActive ? 'text-black' : 'text-gray-300 group-hover:text-black'}`}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] uppercase font-black tracking-[0.2em] whitespace-nowrap transition-all duration-300
                  ${isSidebarHovered || isMobileOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  ${isActive ? 'text-black' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                {isActive && <div className="absolute left-0 w-[3px] h-6 bg-black"></div>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button onClick={() => { localStorage.clear(); router.push('/'); }} className="p-6 border-t border-black/5 flex items-center group shrink-0">
          <div className="w-[22px] flex justify-center text-gray-300 group-hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </div>
          <span className={`ml-8 text-[10px] uppercase font-black tracking-widest text-gray-400 transition-opacity whitespace-nowrap ${isSidebarHovered || isMobileOpen ? 'opacity-100' : 'opacity-0'}`}>
            Logout
          </span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-500 ${isSidebarHovered ? 'md:pl-64' : 'md:pl-[70px]'}`}>
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-6 md:px-8 sticky top-0 z-40">
          <button
            className="md:hidden p-2 -ml-2 hover:bg-black/5 transition-colors rounded-lg"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="text-[9px] font-bold text-gray-400 tracking-[0.3em] uppercase hidden md:block italic">
            Root / {pathname.split('/').filter(Boolean).pop() || 'Overview'}
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-black/10 px-4 py-2 hover:bg-black hover:text-white transition-all">
              <ExternalLink size={12} className="opacity-50 group-hover:opacity-100" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-zinc-100 border border-black/5 flex items-center justify-center text-[10px] font-black">{user?.name?.[0]}</div>
               <span className="hidden xs:block text-[10px] font-black uppercase tracking-widest">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Area - REMOVED the max-width and extra padding */}
        <main className="flex-1 overflow-y-auto scroll-smooth bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
}