'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchProducts = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const url = filter === 'all' ? '/api/admin/products?limit=100' : `/api/admin/products?status=${filter}&limit=100`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) setProducts(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [filter]);
  // Price calculation function
  const getProductPriceRange = (product) => {
    // First try basePrice
    if (product.basePrice) {
      return `Rs ${product.basePrice}`;
    }

    // Then try sizes pricing
    if (product.sizes && product.sizes.length > 0) {
      const prices = product.sizes
        .filter(size => size.price > 0)
        .map(size => size.price);

      if (prices.length === 0) return 'No price set';

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      return minPrice === maxPrice
        ? `Rs ${minPrice}`
        : `Rs ${minPrice} - Rs ${maxPrice}`;
    }

    // Fallback to old price field (if exists)
    if (product.price) {
      return `Rs ${product.price}`;
    }

    return 'No price';
  };

  // Stock calculation function
  const getTotalStock = (product) => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.reduce((total, size) => total + (size.stock || 0), 0);
    }
    return product.stock || 0;
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.success) {
        // UI se product remove karne ke liye state update karein
        setProducts(products.filter(p => p._id !== id));
        alert('Product deleted successfully');
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Something went wrong while deleting');
    }
  };
  return (
    <div className="space-y-12 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/5 pb-10">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">Inventory</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300 font-bold mt-2">Active Catalog Management</p>
        </div>
        <Link href="/admin/products/add" className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-zinc-800 transition-all">+ Add Product</Link>
      </div>

      <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'active', 'draft', 'archived'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-[10px] uppercase font-black tracking-[0.2em] transition-all relative pb-2 ${filter === s ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}>
            {s} {filter === s && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></div>}
          </button>
        ))}
      </div>

      <div className="bg-white border border-black/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5">
              <th className="p-6 text-[10px] uppercase tracking-widest font-black text-gray-400">Product Detail</th>
              <th className="p-6 text-[10px] uppercase tracking-widest font-black text-gray-400 hidden md:table-cell">Pricing</th>
              <th className="p-6 text-[10px] uppercase tracking-widest font-black text-gray-400 hidden lg:table-cell">Stock</th>
              <th className="p-6 text-[10px] uppercase tracking-widest font-black text-gray-400 hidden lg:table-cell">Status</th>
              <th className="p-6 text-[10px] uppercase tracking-widest font-black text-gray-400 text-right">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="group hover:bg-[#fafafa] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-zinc-100 relative grayscale group-hover:grayscale-0 transition-all border border-black/5">
                        {p.images?.[0] && <Image src={p.images[0].url} alt="" fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">{p.name}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">{p.category?.name || 'Uncategorized'}</p>
                        <p className="text-[8px] text-gray-300 uppercase tracking-widest mt-1">
                          {p.productType || 'No type'} • {p.material || 'No material'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 hidden md:table-cell">
                    <div>
                      <span className="text-sm font-bold">{getProductPriceRange(p)}</span>
                      {p.sizes && p.sizes.length > 0 && (
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">
                          {p.sizes.length} size{p.sizes.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-6 hidden lg:table-cell">
                    <div>
                      <span className="text-sm font-bold">{getTotalStock(p)}</span>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">units</p>
                    </div>
                  </td>
                  <td className="p-6 hidden lg:table-cell">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border ${p.status === 'active' ? 'border-emerald-500 text-emerald-600' : p.status === 'draft' ? 'border-yellow-500 text-yellow-600' : 'border-gray-200 text-gray-400'}`}>
                        {p.status}
                      </span>
                      {p.featured && (
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-blue-100 text-blue-600">
                          Featured
                        </span>
                      )}
                      {p.trending && (
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-purple-100 text-purple-600">
                          Trending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-right space-x-4">
                    <Link href={`/admin/products/add?edit=${p._id}`} className="text-[10px] font-black uppercase tracking-tighter hover:underline">Edit</Link>
                    <button
                      onClick={() => handleDelete(p._id)} // Fixed here
                      className="text-[10px] font-black uppercase tracking-tighter text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view for better responsiveness */}
      <div className="md:hidden space-y-4">
        {products.map((p) => (
          <div key={p._id} className="bg-white border border-black/5 p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-zinc-100 relative border border-black/5">
                {p.images?.[0] && <Image src={p.images[0].url} alt="" fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-black uppercase tracking-tight">{p.name}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">{p.category?.name || 'Uncategorized'}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-bold">{getProductPriceRange(p)}</span>
                <span className="text-[9px] text-gray-400 ml-2">• {getTotalStock(p)} units</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/products/add?edit=${p._id}`} className="text-[10px] font-black uppercase tracking-tighter hover:underline">Edit</Link>
                <button onClick={() => handleDelete(p._id)} // Fixed here
                  className="text-[10px] font-black uppercase tracking-tighter text-red-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}