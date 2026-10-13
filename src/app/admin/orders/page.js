'use client';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'delivered', 'cancelled'];

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

// Where the order came from, in one short label.
function sourceLabel(tracking = {}) {
  if (tracking.utmSource) {
    return [tracking.utmSource, tracking.utmCampaign].filter(Boolean).join(' / ');
  }
  if (tracking.fbclid) return 'facebook (ad click)';
  if (tracking.referrer) {
    try {
      return new URL(tracking.referrer).hostname;
    } catch {
      return 'referral';
    }
  }
  return 'direct';
}

function MetaBadge({ label, result }) {
  let text = 'not sent';
  let style = 'bg-zinc-100 text-zinc-400';
  if (result?.sentAt) { text = 'sent'; style = 'bg-green-100 text-green-600'; }
  else if (result?.error) { text = 'failed'; style = 'bg-red-100 text-red-600'; }
  else if (result?.skipped) { text = 'skipped'; style = 'bg-zinc-100 text-zinc-500'; }
  return (
    <span title={result?.error || ''} className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 ${style}`}>
      Meta {label}: {text}
    </span>
  );
}

function OrderCard({ order, onUpdated, onDeleted }) {
  const [customer, setCustomer] = useState({
    name: order.customer?.name || '',
    phone: order.customer?.phone || '',
    city: order.customer?.city || '',
    address: order.customer?.address || '',
  });
  const [notes, setNotes] = useState(order.notes || '');
  const [busy, setBusy] = useState(false);

  const isSale = order.status === 'confirmed' || order.status === 'delivered';
  const purchase = order.metaEvents?.purchase;

  const update = async (extra = {}) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ customer, notes, ...extra }),
      });
      const data = await res.json();
      if (data.success) onUpdated(data.data);
      else alert(data.message || 'Could not update order');
    } catch {
      alert('Could not update order');
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (status) => {
    if (status === 'cancelled' && !confirm(`Cancel order ${order.orderRef}?`)) return;
    update({ status });
  };

  const handleDelete = async () => {
    if (!confirm(`Delete order ${order.orderRef}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (data.success) onDeleted(order._id);
      else alert(data.message || 'Could not delete order');
    } catch {
      alert('Could not delete order');
    } finally {
      setBusy(false);
    }
  };

  const field = (key, placeholder, className = '') => (
    <input
      value={customer[key]}
      onChange={(e) => setCustomer((c) => ({ ...c, [key]: e.target.value }))}
      placeholder={placeholder}
      className={`border border-black/10 px-3 py-2 text-xs w-full focus:outline-none focus:border-black ${className}`}
    />
  );

  const waPhone = customer.phone.replace(/\D/g, '').replace(/^0/, '92');

  return (
    <article className={`bg-white border border-black/5 p-5 md:p-6 space-y-4 ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
            {order.orderRef}
            <span className={`text-[8px] px-2 py-0.5 tracking-widest ${STATUS_STYLES[order.status]}`}>{order.status}</span>
          </h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
            {new Date(order.createdAt).toLocaleString('en-PK')} • Source: {sourceLabel(order.tracking)}
          </p>
        </div>
        <p className="text-xl font-black">Rs {order.subtotal}</p>
      </div>

      <ul className="text-xs space-y-1">
        {order.items.map((item, i) => (
          <li key={i}>
            <strong>{item.name}</strong>
            {item.size && <> • Size {item.size}</>}
            {item.color && <> • {item.color}</>}
            {' '}• Qty {item.quantity} × Rs {item.price}
            {item.sku && <span className="text-gray-400"> • {item.sku}</span>}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {field('name', 'Customer name')}
        {field('phone', 'Phone (required to confirm)')}
        {field('city', 'City')}
        {field('address', 'Address')}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          rows={2}
          className="border border-black/10 px-3 py-2 text-xs w-full sm:col-span-2 focus:outline-none focus:border-black"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <MetaBadge label="Lead" result={order.metaEvents?.lead} />
        <MetaBadge label="Purchase" result={purchase} />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-3 border-t border-black/5">
        {order.status === 'pending' && (
          <button type="button" onClick={() => setStatus('confirmed')} className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800">
            Confirm order
          </button>
        )}
        {order.status === 'confirmed' && (
          <button type="button" onClick={() => setStatus('delivered')} className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800">
            Mark delivered
          </button>
        )}
        <button type="button" onClick={() => update()} className="text-[10px] font-black uppercase tracking-tighter hover:underline">
          Save details
        </button>
        {waPhone && (
          <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-tighter text-green-600 hover:underline">
            WhatsApp customer
          </a>
        )}
        {isSale && !purchase?.sentAt && (purchase?.error || purchase?.skipped) && (
          <button type="button" onClick={() => update({ resendPurchase: true })} className="text-[10px] font-black uppercase tracking-tighter hover:underline">
            Retry Meta purchase
          </button>
        )}
        {order.status === 'cancelled' ? (
          <button type="button" onClick={() => setStatus('pending')} className="text-[10px] font-black uppercase tracking-tighter hover:underline">
            Reopen
          </button>
        ) : (
          <button type="button" onClick={() => setStatus('cancelled')} className="text-[10px] font-black uppercase tracking-tighter text-red-400 hover:text-red-600">
            Cancel
          </button>
        )}
        <button type="button" onClick={handleDelete} className="text-[10px] font-black uppercase tracking-tighter text-red-400 hover:text-red-600 flex items-center gap-1 ml-auto">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </article>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/orders', { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.data);
        else setError(data.message || 'Could not load orders');
      })
      .catch(() => setError('Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  const countFor = (status) =>
    status === 'all' ? orders.length : orders.filter((o) => o.status === status).length;

  const query = search.trim().toLowerCase();
  const visible = orders.filter((o) => {
    if (tab !== 'all' && o.status !== tab) return false;
    if (!query) return true;
    return [o.orderRef, o.customer?.name, o.customer?.phone]
      .some((v) => String(v || '').toLowerCase().includes(query));
  });

  const salesTotal = orders
    .filter((o) => o.status === 'confirmed' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div className="space-y-8 px-4 py-6 md:px-8 md:py-10">
      <div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Orders</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2">
          WhatsApp orders • {countFor('pending')} pending • Confirmed sales Rs {salesTotal}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTab(s)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border ${tab === s ? 'bg-black text-white border-black' : 'border-black/10 hover:border-black'}`}
            >
              {s} ({countFor(s)})
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ref, name or phone"
          className="border border-black/10 px-4 py-2 text-xs w-full md:w-72 focus:outline-none focus:border-black"
        />
      </div>

      {loading && <p className="text-xs text-gray-400 uppercase tracking-widest">Loading…</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="text-xs text-gray-400 uppercase tracking-widest">No orders here.</p>
      )}

      <div className="space-y-4">
        {visible.map((o) => (
          <OrderCard
            key={o._id}
            order={o}
            onUpdated={(updated) => setOrders((list) => list.map((x) => (x._id === updated._id ? updated : x)))}
            onDeleted={(id) => setOrders((list) => list.filter((x) => x._id !== id))}
          />
        ))}
      </div>
    </div>
  );
}
