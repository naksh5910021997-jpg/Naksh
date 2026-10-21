'use client';

import { useEffect, useState } from 'react';
import { pushToDataLayer } from '@/lib/gtm';
import { startWhatsAppOrder } from '@/lib/whatsapp-order';
import { getBundleOptions } from '@/lib/bundle-pricing';
import { BUSINESS } from '@/lib/seo';

// Size-set picker, price breakdown and WhatsApp order button for a combo.
export default function BundlePurchasePanel({ bundle }) {
  const options = getBundleOptions(bundle);
  const defaultOption = options.find((o) => o.inStock) || options[0];
  const [selectedId, setSelectedId] = useState(defaultOption?._id);
  const [quantity, setQuantity] = useState(1);
  // null | { type: 'success' | 'error', url }
  const [orderStatus, setOrderStatus] = useState(null);

  const option = options.find((o) => o._id === selectedId) || defaultOption;

  const ecommerceItems = (qty) => [
    {
      item_id: bundle.tshirt._id,
      item_name: bundle.tshirt.name,
      item_category: bundle.tshirt.category?.name,
      item_variant: option?.tshirtSize,
      item_list_name: bundle.title,
      price: option?.tshirtPrice,
      quantity: qty,
    },
    {
      item_id: bundle.trouser._id,
      item_name: bundle.trouser.name,
      item_category: bundle.trouser.category?.name,
      item_variant: option?.trouserSize,
      item_list_name: bundle.title,
      price: option?.trouserPrice,
      quantity: qty,
    },
  ];

  useEffect(() => {
    if (!option) return;
    pushToDataLayer({
      event: 'view_item',
      ecommerce: { currency: 'PKR', value: option.price, items: ecommerceItems(1) },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle._id]);

  if (!option) return null;

  const buildMessage = (orderRef) => {
    const url = `${window.location.origin}/bundles/${bundle.slug}`;
    return [
      '🛍️ *Combo Order - Naksh Shop*',
      `*Order Ref:* ${orderRef}`,
      '',
      `*Combo:* ${bundle.title}`,
      `*Size set:* ${option.label}`,
      `*T-Shirt:* ${bundle.tshirt.name} (Size ${option.tshirtSize})`,
      `*Trouser:* ${bundle.trouser.name} (Size ${option.trouserSize})`,
      `*Combo price:* Rs ${option.price}`,
      `*Quantity:* ${quantity}`,
      `*Total:* Rs ${option.price * quantity}`,
      ...(option.savings > 0 ? [`*You save:* Rs ${option.savings * quantity}`] : []),
      '',
      `*Combo Link:* ${url}`,
      '',
      'Please confirm availability and provide delivery details. Thank you! 🙏',
    ].join('\n');
  };

  const handleOrder = () => {
    const { opened, url } = startWhatsAppOrder({
      buildMessage,
      order: { bundleId: bundle._id, optionId: option._id, quantity },
      value: option.price * quantity,
      items: ecommerceItems(quantity),
    });
    setOrderStatus({ type: opened ? 'success' : 'error', url });
  };

  return (
    <div className="space-y-8">
      {/* Price */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-black text-text tracking-tighter">Rs {option.price}</span>
          {option.separatePrice > option.price && (
            <span className="text-xl text-text opacity-40 line-through font-medium">Rs {option.separatePrice}</span>
          )}
        </div>
        {option.savings > 0 && (
          <span className="inline-block text-[10px] font-black bg-green-50 text-green-600 px-2 py-1 uppercase rounded-sm">
            You save Rs {option.savings} ({option.savingsPercent}%) with this combo
          </span>
        )}
      </div>

      {/* Size sets */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-black mb-3 text-text opacity-60">Select Size Set *</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((o) => (
            <button
              key={o._id}
              type="button"
              onClick={() => setSelectedId(o._id)}
              disabled={!o.inStock}
              className={`border rounded-md p-3 text-left transition-all
                ${o._id === option._id ? 'border-text bg-text text-card-bg' : 'border-accent-dim hover:border-text text-text'}
                ${!o.inStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-sm font-black uppercase tracking-tight">{o.label}</div>
              <div className="text-[10px] opacity-70 mt-1">Tee {o.tshirtSize} • Trouser {o.trouserSize}</div>
              <div className="text-[11px] font-bold mt-1">
                Rs {o.price}
                {o.separatePrice > o.price && <span className="opacity-50 line-through font-normal ml-2">Rs {o.separatePrice}</span>}
              </div>
              {!o.inStock && <div className="text-[9px] text-red-500 font-bold mt-1 uppercase">Out of stock</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-card-bg border border-accent-dim rounded-md p-4 space-y-2 text-xs text-text">
        <div className="flex justify-between"><span className="opacity-70">{bundle.tshirt.name} ({option.tshirtSize})</span><span>Rs {option.tshirtPrice}</span></div>
        <div className="flex justify-between"><span className="opacity-70">{bundle.trouser.name} ({option.trouserSize})</span><span>Rs {option.trouserPrice}</span></div>
        {option.savings > 0 && (
          <div className="flex justify-between text-green-600 font-bold"><span>Combo discount</span><span>−Rs {option.savings}</span></div>
        )}
        <div className="flex justify-between font-black border-t border-accent-dim pt-2"><span>Combo price</span><span>Rs {option.price}</span></div>
      </div>

      {/* Quantity */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-black mb-3 text-text opacity-60">Quantity</h3>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-accent-dim rounded-md flex items-center justify-center hover:border-text transition-colors text-text font-black">−</button>
          <span className="text-lg font-black text-text min-w-[2rem] text-center">{quantity}</span>
          <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border border-accent-dim rounded-md flex items-center justify-center hover:border-text transition-colors text-text font-black">+</button>
        </div>
      </div>

      <div className="bg-card-bg border border-accent-dim rounded-md p-4 flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest font-black text-text opacity-60">Total Amount</span>
        <span className="text-2xl font-black text-text">Rs {option.price * quantity}</span>
      </div>

      <button
        type="button"
        onClick={handleOrder}
        disabled={!option.inStock}
        className={`w-full py-4 px-6 text-[11px] uppercase font-black tracking-[0.3em] rounded-md transition-all
          ${option.inStock ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        {option.inStock ? 'Order Combo via WhatsApp' : 'Out of Stock'}
      </button>

      {orderStatus?.type === 'success' && (
        <div role="status" className="border border-green-500 bg-green-50 text-green-700 rounded-md px-4 py-3 text-xs font-medium flex items-start justify-between gap-3">
          <p>
            <strong className="block font-black uppercase tracking-widest text-[10px] mb-1">✓ Order details ready on WhatsApp</strong>
            Press <strong>Send</strong> in WhatsApp to place your order. We&apos;ll confirm availability and delivery with you there.
          </p>
          <button type="button" onClick={() => setOrderStatus(null)} aria-label="Dismiss" className="opacity-60 hover:opacity-100">×</button>
        </div>
      )}
      {orderStatus?.type === 'error' && (
        <div role="alert" className="border border-red-500 bg-red-50 text-red-600 rounded-md px-4 py-3 text-xs font-medium">
          <strong className="block font-black uppercase tracking-widest text-[10px] mb-1">WhatsApp couldn&apos;t open</strong>
          Your browser may have blocked the popup.{' '}
          <a href={orderStatus.url} target="_blank" rel="noopener noreferrer" className="underline font-bold">Tap here to open WhatsApp</a>{' '}
          or message us at {BUSINESS.telephone}.
        </div>
      )}
    </div>
  );
}
