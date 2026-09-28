'use client';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    fetch('/api/contact', { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMessages(data.data);
        else setError(data.message || 'Could not load messages');
      })
      .catch(() => setError('Could not load messages'))
      .finally(() => setLoading(false));
  }, []);

  const toggleRead = async (m) => {
    setBusyId(m._id);
    try {
      const res = await fetch(`/api/contact/${m._id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ read: !m.read }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((list) => list.map((x) => (x._id === m._id ? { ...x, read: !m.read } : x)));
      } else {
        alert(data.message || 'Could not update message');
      }
    } catch {
      alert('Could not update message');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (m) => {
    if (!confirm(`Delete the message from ${m.name}? This cannot be undone.`)) return;
    setBusyId(m._id);
    try {
      const res = await fetch(`/api/contact/${m._id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setMessages((list) => list.filter((x) => x._id !== m._id));
      } else {
        alert(data.message || 'Could not delete message');
      }
    } catch {
      alert('Could not delete message');
    } finally {
      setBusyId(null);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-5xl font-black uppercase tracking-tighter italic">Messages</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2">
          Contact form queries • {messages.length} total • {unreadCount} new
        </p>
      </div>

      {loading && <p className="text-xs text-gray-400 uppercase tracking-widest">Loading…</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!loading && !error && messages.length === 0 && (
        <p className="text-xs text-gray-400 uppercase tracking-widest">No messages yet.</p>
      )}

      <div className="space-y-4">
        {messages.map((m) => (
          <article
            key={m._id}
            className={`bg-white border p-6 space-y-3 ${m.read ? 'border-black/5' : 'border-black border-l-4'} ${busyId === m._id ? 'opacity-50' : ''}`}
          >
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                  {!m.read && <span className="text-[8px] bg-black text-white px-2 py-0.5 tracking-widest">New</span>}
                  {m.subject || 'No subject'}
                </h2>
                <p className="text-xs text-gray-500">
                  {m.name} • <a href={`mailto:${m.email}`} className="underline">{m.email}</a>
                  {m.phone && <> • <a href={`tel:${m.phone}`} className="underline">{m.phone}</a></>}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  {new Date(m.createdAt).toLocaleString('en-PK')}
                </p>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 ${m.emailSent ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
                  {m.emailSent ? 'Emailed' : 'Saved only'}
                </span>
              </div>
            </div>

            <p className="text-sm whitespace-pre-wrap">{m.message}</p>

            <div className="flex gap-6 pt-3 border-t border-black/5">
              <button
                type="button"
                disabled={busyId === m._id}
                onClick={() => toggleRead(m)}
                className="text-[10px] font-black uppercase tracking-tighter hover:underline"
              >
                {m.read ? 'Mark as new' : 'Mark as read'}
              </button>
              <button
                type="button"
                disabled={busyId === m._id}
                onClick={() => handleDelete(m)}
                className="text-[10px] font-black uppercase tracking-tighter text-red-400 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
