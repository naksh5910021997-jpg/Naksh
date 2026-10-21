'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { getBundleSummary, isBundleLive } from '@/lib/bundle-pricing';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// Why a combo isn't showing in the shop, or null when it's live.
function hiddenReason(bundle) {
  if (bundle.status !== 'active') return 'Draft';
  const now = new Date();
  if (bundle.startsAt && new Date(bundle.startsAt) > now) return 'Not started';
  if (bundle.endsAt && new Date(bundle.endsAt) < now) return 'Ended';
  if (!bundle.tshirt || !bundle.trouser) return 'Product deleted';
  if (!isBundleLive(bundle)) return 'Product not active';
  return null;
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/bundles', { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBundles(data.data);
        else setError(data.message || 'Could not load combos');
      })
      .catch(() => setError('Could not load combos'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (bundle) => {
    if (!confirm(`Delete the combo "${bundle.title}"? The T-shirt and trouser are not affected.`)) return;
    const res = await fetch(`/api/admin/bundles/${bundle._id}`, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (data.success) setBundles((list) => list.filter((b) => b._id !== bundle._id));
    else alert(data.message || 'Could not delete combo');
  };

  return (
    <div className="space-y-8 px-4 py-6 md:px-8 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/5 pb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Combos</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2">
            T-shirt + trouser sets at a combo price • {bundles.length} total
          </p>
        </div>
        <Link href="/admin/bundles/new" className="bg-black text-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-zinc-800">
          + New Combo
        </Link>
      </div>

      {loading && <p className="text-xs text-gray-400 uppercase tracking-widest">Loading…</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!loading && !error && bundles.length === 0 && (
        <p className="text-xs text-gray-400 uppercase tracking-widest">No combos yet. Create one to sell a T-shirt and trouser together.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {bundles.map((bundle) => {
          const summary = getBundleSummary(bundle);
          const reason = hiddenReason(bundle);
          return (
            <article key={bundle._id} className="bg-white border border-black/5 p-5 flex gap-4">
              <div className="flex gap-1 shrink-0">
                {[bundle.tshirt, bundle.trouser].map((p, i) => (
                  <div key={i} className="relative w-16 h-20 bg-zinc-100 overflow-hidden">
                    {p?.images?.[0]?.url && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="64px" />}
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-black uppercase tracking-tight truncate">{bundle.title}</h2>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${reason ? 'bg-zinc-100 text-zinc-500' : 'bg-green-100 text-green-700'}`}>
                    {reason || 'Live'}
                  </span>
                  {bundle.featured && <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-black text-white">Homepage</span>}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {bundle.tshirt?.name || 'T-shirt deleted'} + {bundle.trouser?.name || 'Trouser deleted'}
                </p>
                <p className="text-xs">
                  {summary.options.length} size option{summary.options.length === 1 ? '' : 's'} • from <strong>Rs {summary.fromPrice}</strong>
                  {summary.maxSavings > 0 && <span className="text-green-600 font-bold"> • save up to Rs {summary.maxSavings}</span>}
                  {!summary.inStock && <span className="text-red-500 font-bold"> • out of stock</span>}
                </p>
                <div className="flex gap-5 pt-1">
                  <Link href={`/admin/bundles/${bundle._id}`} className="text-[10px] font-black uppercase tracking-tighter hover:underline">Edit</Link>
                  {!reason && (
                    <a href={`/bundles/${bundle.slug}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-tighter hover:underline">View in shop</a>
                  )}
                  <button type="button" onClick={() => handleDelete(bundle)} className="text-[10px] font-black uppercase tracking-tighter text-red-400 hover:text-red-600 flex items-center gap-1">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
