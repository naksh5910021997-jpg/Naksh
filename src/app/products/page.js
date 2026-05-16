// app/products/page.js - Complete file replace karo:

import { Suspense } from 'react';
import ProductsPageContent from '../../components/products/ProductsPageContent';

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageLoading() {
  return (
    <div className="bg-main-bg min-h-screen pt-20 flex flex-col font-sans">
      <div className="container mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="h-8 bg-accent-dim rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-accent-dim rounded w-32 animate-pulse" />
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Loading */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-card-bg border border-accent-dim rounded-lg p-8 space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-3 bg-accent-dim rounded w-20 animate-pulse" />
                  <div className="h-10 bg-accent-dim rounded animate-pulse" />
                </div>
              ))}
            </div>
          </aside>

          {/* Products Loading */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card-bg border border-accent-dim rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}