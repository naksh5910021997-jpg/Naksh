'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { getBundleOptionDetails } from '@/lib/bundle-pricing';

const labelClass = 'text-[9px] uppercase font-black tracking-widest text-gray-400';
const inputClass = 'w-full border border-black/10 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white';

const emptyOption = () => ({ label: '', tshirtSize: '', trouserSize: '', price: '', percent: '' });

// <input type="datetime-local"> needs local "YYYY-MM-DDTHH:mm".
function toLocalInput(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const token = () => localStorage.getItem('token');

async function fetchProducts(garmentType) {
  const res = await fetch(`/api/admin/products?garmentType=${garmentType}&limit=500`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  const data = await res.json();
  return data.success ? data.data : [];
}

function ProductPicker({ label, products, value, onChange }) {
  const selected = products.find((p) => p._id === value);
  return (
    <div className="space-y-2">
      <label className={labelClass}>{label} *</label>
      <div className="flex gap-3 items-center">
        <div className="relative w-14 h-16 shrink-0 bg-zinc-100 border border-black/5 overflow-hidden">
          {selected?.images?.[0]?.url && (
            <Image src={selected.images[0].url} alt={selected.name} fill className="object-cover" sizes="56px" />
          )}
        </div>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} required>
          <option value="">Select…</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}{p.status !== 'active' ? ` (${p.status})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function BundleForm({ bundleId }) {
  const router = useRouter();
  const [tshirts, setTshirts] = useState([]);
  const [trousers, setTrousers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    tshirt: '',
    trouser: '',
    options: [emptyOption()],
    image: null,
    status: 'active',
    featured: false,
    startsAt: '',
    endsAt: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const requests = [fetchProducts('tshirt'), fetchProducts('trouser')];
        if (bundleId) {
          requests.push(
            fetch(`/api/admin/bundles/${bundleId}`, { headers: { Authorization: `Bearer ${token()}` } }).then((r) => r.json())
          );
        }
        const [tshirtList, trouserList, bundleRes] = await Promise.all(requests);
        setTshirts(tshirtList);
        setTrousers(trouserList);
        if (bundleRes) {
          if (!bundleRes.success) {
            setError(bundleRes.message || 'Could not load combo');
            return;
          }
          const b = bundleRes.data;
          setForm({
            title: b.title || '',
            description: b.description || '',
            tshirt: String(b.tshirt || ''),
            trouser: String(b.trouser || ''),
            options: (b.options || []).map((o) => ({ ...o, price: String(o.price), percent: '' })),
            image: b.image?.url ? b.image : null,
            status: b.status || 'active',
            featured: !!b.featured,
            startsAt: toLocalInput(b.startsAt),
            endsAt: toLocalInput(b.endsAt),
          });
        }
      } catch {
        setError('Could not load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bundleId]);

  const tshirt = tshirts.find((p) => p._id === form.tshirt);
  const trouser = trousers.find((p) => p._id === form.trouser);

  const details = useMemo(
    () => form.options.map((o) => getBundleOptionDetails({ tshirt, trouser }, { ...o, price: Number(o.price) || 0 })),
    [form.options, tshirt, trouser]
  );

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const updateOption = (index, changes) => {
    setForm((f) => {
      const options = f.options.map((o, i) => {
        if (i !== index) return o;
        const next = { ...o, ...changes };
        // With a % set, the price follows the sizes' separate total.
        if (next.percent !== '' && !('price' in changes)) {
          const separate = getBundleOptionDetails({ tshirt, trouser }, { ...next, price: 0 }).separatePrice;
          if (separate > 0) next.price = String(Math.round(separate * (1 - Number(next.percent) / 100)));
        }
        return next;
      });
      return { ...f, options };
    });
  };

  // Changing a product invalidates sizes chosen for the old one.
  const changeProduct = (field, sizeField, value) => {
    setForm((f) => ({
      ...f,
      [field]: value,
      options: f.options.map((o) => ({ ...o, [sizeField]: '' })),
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'bundles');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: data,
      });
      const result = await res.json();
      if (result.success) set('image', { url: result.data.url, publicId: result.data.publicId });
      else alert(result.message || 'Upload failed');
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(bundleId ? `/api/admin/bundles/${bundleId}` : '/api/admin/bundles', {
        method: bundleId ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          options: form.options.map(({ percent, ...o }) => ({ ...o, price: Number(o.price) })),
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (data.success) router.push('/admin/bundles');
      else setError(data.message || 'Could not save combo');
    } catch {
      setError('Could not save combo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const sizeLabel = (size) => `${size.size} — Rs ${size.onSale && size.salePrice > 0 ? size.salePrice : size.price}${size.stock <= 0 ? ' (out of stock)' : ''}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl">
      {/* Basics */}
      <section className="bg-white border border-black/5 p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <label className={labelClass}>Title *</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClass} placeholder="e.g. Blue Home Tee + Beige Jogger Set" required />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Description</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputClass} min-h-[110px]`} placeholder="What's in the set, why it's a good deal…" />
        </div>
      </section>

      {/* Products */}
      <section className="bg-white border border-black/5 p-6 md:p-8 grid md:grid-cols-2 gap-6">
        <ProductPicker label="T-Shirt" products={tshirts} value={form.tshirt} onChange={(v) => changeProduct('tshirt', 'tshirtSize', v)} />
        <ProductPicker label="Trouser" products={trousers} value={form.trouser} onChange={(v) => changeProduct('trouser', 'trouserSize', v)} />
      </section>

      {/* Size options */}
      <section className="bg-white border border-black/5 p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-tight">Size options & price</h2>
          <p className="text-xs text-gray-500 mt-1">
            Add one row per size set. Type a % to calculate the price from the separate total, or type the price directly.
            The combo price stays fixed even if the products go on sale.
          </p>
        </div>

        {(!tshirt || !trouser) && (
          <p className="text-xs text-amber-600">Select the T-shirt and trouser first to choose sizes.</p>
        )}

        {form.options.map((option, index) => {
          const d = details[index];
          return (
            <div key={option._id || index} className="border border-black/10 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest">Option {index + 1}</span>
                {form.options.length > 1 && (
                  <button type="button" onClick={() => set('options', form.options.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600" aria-label="Remove option">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className={labelClass}>Label</label>
                  <input value={option.label} onChange={(e) => updateOption(index, { label: e.target.value })} className={inputClass} placeholder="e.g. Small / 2-4 Years" />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>T-shirt size *</label>
                  <select value={option.tshirtSize} onChange={(e) => updateOption(index, { tshirtSize: e.target.value })} className={inputClass} required disabled={!tshirt}>
                    <option value="">Select…</option>
                    {(tshirt?.sizes || []).map((s) => <option key={s.size} value={s.size}>{sizeLabel(s)}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Trouser size *</label>
                  <select value={option.trouserSize} onChange={(e) => updateOption(index, { trouserSize: e.target.value })} className={inputClass} required disabled={!trouser}>
                    <option value="">Select…</option>
                    {(trouser?.sizes || []).map((s) => <option key={s.size} value={s.size}>{sizeLabel(s)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 items-end">
                <div className="space-y-1">
                  <label className={labelClass}>Discount %</label>
                  <input type="number" min="0" max="90" value={option.percent} onChange={(e) => updateOption(index, { percent: e.target.value })} className={inputClass} placeholder="e.g. 10" />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Combo price (Rs) *</label>
                  <input type="number" min="1" value={option.price} onChange={(e) => updateOption(index, { price: e.target.value, percent: '' })} className={inputClass} required />
                </div>
                <div className="text-xs space-y-1 pb-2">
                  <p className="text-gray-500">Separately: <strong>Rs {d.separatePrice}</strong></p>
                  {d.separatePrice > 0 && Number(option.price) > 0 && (
                    Number(option.price) < d.separatePrice
                      ? <p className="text-green-600 font-bold">Customer saves Rs {d.savings} ({d.savingsPercent}%)</p>
                      : <p className="text-red-500 font-bold">Combo is not cheaper than buying separately</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button type="button" onClick={() => set('options', [...form.options, emptyOption()])} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-black px-4 py-3 hover:bg-zinc-100">
          <Plus size={12} /> Add size option
        </button>
      </section>

      {/* Image, visibility, dates */}
      <section className="bg-white border border-black/5 p-6 md:p-8 grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className={labelClass}>Combo photo (optional)</label>
          <p className="text-xs text-gray-500">Without a photo, the shop shows both product photos side by side.</p>
          {form.image ? (
            <div className="relative w-40 aspect-[3/4] border border-black/10">
              <Image src={form.image.url} alt="Combo" fill className="object-cover" sizes="160px" />
              <button type="button" onClick={() => set('image', null)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow" aria-label="Remove photo">
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 w-fit cursor-pointer text-[10px] font-black uppercase tracking-widest border border-dashed border-black/30 px-4 py-3 hover:border-black">
              <Upload size={12} /> {uploading ? 'Uploading…' : 'Upload photo'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => handleImageUpload(e.target.files?.[0])} />
            </label>
          )}
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
              <option value="active">Active — visible in shop</option>
              <option value="draft">Draft — hidden</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
            Show on homepage
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>Offer starts</label>
              <input type="datetime-local" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Offer ends</label>
              <input type="datetime-local" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} className={inputClass} />
            </div>
          </div>
          <p className="text-[10px] text-gray-400">Leave dates empty to keep the combo running until you set it to Draft.</p>
        </div>
      </section>

      {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading} className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 disabled:opacity-50">
          {saving ? 'Saving…' : bundleId ? 'Save changes' : 'Create combo'}
        </button>
        <button type="button" onClick={() => router.push('/admin/bundles')} className="border border-black px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-100">
          Cancel
        </button>
      </div>
    </form>
  );
}
