'use client';

import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';

export default function AddProductPage() {
  return (
    <div className="space-y-12">
      {/* Editorial Header */}
      <div className="border-b py-8 px-4">
        <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider mb-3">
          <Link href="/admin/products" className="hover:text-black transition-colors">
            ← Inventory
          </Link>
          <span>/</span>
          <span className="text-black">New Entry</span>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              Create Product<span className="text-blue-600 not-italic">.</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mt-2">
              Database Synchronization / SKU Generation
            </p>
          </div>

          {/* Quick Instructions Badge */}
          <div className="hidden lg:block bg-black text-white p-6 max-w-[240px]">
            <p className="text-[9px] uppercase tracking-widest leading-relaxed opacity-70">
              Ensure all high-resolution assets are uploaded in 3:4 aspect ratio for optimal studio display.
            </p>
          </div>
        </div>
      </div>

      {/* Form Container - Sharp & Minimal */}
      <div className="border border-black/5 bg-white">
        <ProductForm />
      </div>

      {/* Footer Note */}
      <div className="flex items-center gap-4 opacity-20 grayscale pointer-events-none">
        <div className="h-[1px] flex-1 bg-black"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Naksh Studio System</span>
        <div className="h-[1px] flex-1 bg-black"></div>
      </div>
    </div>
  );
}