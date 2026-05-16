'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, X, ChevronRight, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if ((await res.json()).success) {
        setFormData({ name: '', description: '' });
        setShowForm(false);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

const handleDelete = async (id) => {
  if (!confirm('Are you sure you want to delete this?')) return;

  const token = localStorage.getItem('token');
  try {
    // Dynamic Path: /api/categories/698f54ce...
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (data.success) {
      setCategories(prev => prev.filter(c => c._id !== id));
      // Success feedback
    } else {
      alert(data.message || 'Something went wrong');
    }
  } catch (error) {
    console.error('Frontend Delete Error:', error);
  }
};

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-full overflow-hidden px-4 md:px-6 space-y-8 md:space-y-12">

      {/* --- HEADER SECTION --- */}
      <div className="border-b border-black/5 pb-6">
        <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest mb-4">
          <Link href="/admin" className="hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft size={10} /> Dashboard
          </Link>
          <span>/</span>
          <span className="text-black font-bold">Collections</span>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
              Collections<span className="text-blue-600 not-italic">.</span>
            </h1>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mt-3">
              Database Indexing / Taxonomy
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full md:w-auto bg-black text-white px-6 py-4 md:py-3 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancel Entry' : 'New Collection'}
          </button>
        </div>
      </div>

      {/* --- FORM SECTION --- */}
      {showForm && (
        <div className="border border-black bg-white p-6 md:p-10 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 max-w-2xl">
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-black tracking-widest text-gray-400">
                Collection Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border-b border-gray-200 py-3 text-sm font-bold uppercase focus:outline-none focus:border-black transition-colors rounded-none"
                placeholder="E.G. WINTER DROP '26"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-black tracking-widest text-gray-400">
                Editorial Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-100 bg-gray-50/50 p-4 text-sm focus:outline-none focus:border-black transition-colors min-h-[120px] resize-none rounded-none"
                placeholder="Notes about fabrication..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-all"
            >
              Sync to Database
            </button>
          </form>
        </div>
      )}

      {/* --- GRID SECTION (Updated for Desktop & Delete) --- */}
      {categories.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-widest">No collections indexed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* md:bg-gray-200 removed */}
          {categories.map((c) => (
            <div key={c._id} className="bg-white p-6 md:p-8 flex flex-col border border-black/5 group hover:border-black transition-all relative">

              {/* DELETE BUTTON (Top Right) */}
              <button
                onClick={() => handleDelete(c._id)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-600 md:opacity-0 md:group-hover:opacity-100 transition-all"
                title="Delete Collection"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                   <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">
                    ID: {c._id.slice(-6)}
                  </p>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                </div>

                <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-1 pr-8">
                  {c.name}
                </h3>
                <p className="text-[9px] text-blue-600 font-bold mb-4 uppercase tracking-tighter">
                  /collections/{c.slug}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 italic">
                  {c.description || "No editorial notes provided."}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Manage Assets
                </span>
                <ChevronRight size={14} className="text-black transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- FOOTER STATUS --- */}
      <div className="flex items-center gap-4 py-8">
        <div className="h-[1px] flex-1 bg-black/5"></div>
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300">
          Index Count: {categories.length}
        </span>
        <div className="h-[1px] flex-1 bg-black/5"></div>
      </div>

    </div>
  );
}