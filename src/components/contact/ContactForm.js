'use client';

import { useState } from 'react';
import { BUSINESS } from '@/lib/seo';

const inputStyles =
  'w-full bg-main-bg border border-accent-dim rounded-sm px-4 py-3 text-sm text-text focus:outline-none focus:border-text transition-colors';
const labelStyles = 'text-[10px] uppercase tracking-[0.2em] font-black text-text opacity-60 mb-2 block';

const emptyForm = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(emptyForm);
  // status: idle | sending | success | error
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setFeedback('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setStatus('success');
        setFeedback(data.message);
        setForm(emptyForm);
      } else {
        setStatus('error');
        setFeedback(data.message || 'Your message could not be sent. Please try again.');
      }
    } catch {
      setStatus('error');
      setFeedback('Network error — please check your connection and try again.');
    }
  };

  if (status === 'success') {
    return (
      <div role="status" className="bg-card-bg border border-green-500 rounded-md p-8 md:p-10 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl font-black">✓</div>
        <h2 className="text-xl font-black uppercase tracking-tight text-text">Message Sent</h2>
        <p className="text-sm text-text opacity-70">{feedback}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-[10px] uppercase font-bold tracking-widest border-b border-text pb-1 text-text hover:opacity-60 transition-opacity"
        >
          Send another message
        </button>
      </div>
    );
  }

  const sending = status === 'sending';

  return (
    <form onSubmit={handleSubmit} className="bg-card-bg border border-accent-dim rounded-md p-6 md:p-8 space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={labelStyles}>Name *</label>
          <input id="name" name="name" required maxLength={100} value={form.name} onChange={handleChange} className={inputStyles} />
        </div>
        <div>
          <label htmlFor="email" className={labelStyles}>Email *</label>
          <input id="email" name="email" type="email" required maxLength={200} value={form.email} onChange={handleChange} className={inputStyles} placeholder="name@example.com" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className={labelStyles}>Phone</label>
          <input id="phone" name="phone" type="tel" maxLength={30} value={form.phone} onChange={handleChange} className={inputStyles} placeholder="03XX XXXXXXX" />
        </div>
        <div>
          <label htmlFor="subject" className={labelStyles}>Subject</label>
          <input id="subject" name="subject" maxLength={200} value={form.subject} onChange={handleChange} className={inputStyles} placeholder="Order, sizing, exchange…" />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelStyles}>Message *</label>
        <textarea id="message" name="message" required maxLength={5000} rows={6} value={form.message} onChange={handleChange} className={inputStyles} />
      </div>

      {status === 'error' && (
        <div role="alert" className="border border-red-500 bg-red-50 text-red-600 rounded-sm px-4 py-3 text-xs font-medium">
          {feedback} You can also email us at{' '}
          <a href={`mailto:${BUSINESS.email}`} className="underline">{BUSINESS.email}</a>.
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full bg-text text-card-bg py-4 text-xs uppercase font-bold tracking-widest hover:opacity-80 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
