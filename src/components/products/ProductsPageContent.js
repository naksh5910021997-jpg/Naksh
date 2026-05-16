'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import ProductCard from '@/components/products/ProductCard';
import Footer from '@/components/ui/Footer';
import FilterSidebar from '@/components/products/FilterSidebar';

export default function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    type: searchParams.get('type') || '',
    fit: searchParams.get('fit') || '',
    pattern: searchParams.get('pattern') || '',
    fabric: searchParams.get('fabric') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') || '',
    trending: searchParams.get('trending') || '',
    onSale: searchParams.get('onSale') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [filters, pagination.page]);

  // Update URL when filters change
  const updateURL = (newFilters, newPage = 1) => {
    const params = new URLSearchParams();

    // Add non-empty filters to URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });

    // Add page if not 1
    if (newPage > 1) {
      params.set('page', newPage.toString());
    }

    // Update URL without page reload
    const newURL = params.toString() ? `/products?${params.toString()}` : '/products';
    router.push(newURL, { scroll: false });
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) { console.error(error); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')),
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages,
        }));
      }
    } finally { setLoading(false); }
  };

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    updateURL(updatedFilters, 1);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    updateURL(filters, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: '',
      type: '',
      fit: '',
      pattern: '',
      fabric: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      search: '',
      featured: '',
      trending: '',
      onSale: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    router.push('/products');
  };

  return (
    <div className="bg-main-bg min-h-screen pt-20 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow container mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Browse Products</h1>
            <p className="text-text opacity-60 text-sm mt-1">
              {products.length > 0 && `Showing ${products.length} of ${pagination.total} products`}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 bg-card-bg px-4 py-2 rounded-md border border-accent-dim shadow-soft hover:border-text transition-all group">
            <span className="text-[10px] font-black text-text opacity-60 uppercase tracking-[0.2em]">Sort By</span>
            <div className="relative">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange({ sortBy, sortOrder });
                }}
                className="appearance-none bg-transparent border-none text-xs font-bold text-text focus:ring-0 cursor-pointer pr-6 py-0 leading-tight uppercase tracking-widest"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
                <option value="popularity-desc">Most Popular</option>
                <option value="discount-desc">Best Deals</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-text opacity-60 group-hover:opacity-100">
                <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.values(filters).some(value => value && value !== '' && value !== 'createdAt' && value !== 'desc') && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-text opacity-60">Active Filters:</span>

            {filters.search && (
              <span className="bg-card-bg border border-accent-dim px-3 py-1 rounded-sm text-xs font-bold text-text flex items-center gap-2">
                Search: "{filters.search}"
                <button onClick={() => handleFilterChange({ search: '' })} className="text-text opacity-60 hover:opacity-100">×</button>
              </span>
            )}

            {filters.category && (
              <span className="bg-card-bg border border-accent-dim px-3 py-1 rounded-sm text-xs font-bold text-text flex items-center gap-2">
                Category: {categories.find(c => c._id === filters.category)?.name || filters.category}
                <button onClick={() => handleFilterChange({ category: '' })} className="text-text opacity-60 hover:opacity-100">×</button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-[10px] uppercase tracking-widest font-bold text-text opacity-60 hover:opacity-100 underline underline-offset-2"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                categories={categories}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Products Content */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card-bg border border-accent-dim rounded-lg h-80 animate-pulse flex flex-col p-4">
                    <div className="bg-accent-dim rounded-md h-48 w-full mb-4" />
                    <div className="h-4 bg-accent-dim rounded w-3/4 mb-2" />
                    <div className="h-4 bg-accent-dim rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-card-bg border border-accent-dim rounded-lg">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-xl font-bold text-text">No products found</p>
                <p className="text-text opacity-60 mt-1">Try adjusting your filters or search term.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 bg-text text-card-bg px-6 py-3 text-xs uppercase font-bold tracking-widest hover:opacity-80 transition-opacity rounded-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-16">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 w-10 h-10 flex items-center justify-center rounded-md border border-accent-dim bg-card-bg text-text disabled:opacity-30 hover:bg-main-bg transition-all"
                    >
                      ←
                    </button>

                    <div className="flex gap-2 bg-accent-dim/50 p-1 rounded-md border border-accent-dim">
                      {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-sm text-sm font-bold transition-all ${
                              pagination.page === pageNum
                                ? 'bg-card-bg text-text shadow-soft'
                                : 'text-text opacity-60 hover:opacity-100 hover:bg-card-bg/50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="p-2 w-10 h-10 flex items-center justify-center rounded-md border border-accent-dim bg-card-bg text-text disabled:opacity-30 hover:bg-main-bg transition-all"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}