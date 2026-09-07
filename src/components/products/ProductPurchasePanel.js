'use client';

import { useState } from 'react';
import { getEffectiveSizePrice, getEffectiveSizeComparePrice } from '@/lib/pricing';

export default function ProductPurchasePanel({ product }) {
  const sizes = product.sizes || [];

  // Default to the first in-stock size, falling back to the first size overall
  const defaultSize = sizes.find(s => s.stock > 0) || sizes[0] || null;
  const [selectedSize, setSelectedSize] = useState(defaultSize?.size || '');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const activeSize = sizes.length > 0
    ? sizes.find(s => s.size === selectedSize) || defaultSize
    : null;

  const currentPrice = activeSize
    ? getEffectiveSizePrice(activeSize)
    : (product.basePrice || product.price || 0);

  const comparePrice = activeSize
    ? getEffectiveSizeComparePrice(activeSize)
    : (product.comparePrice || null);

  const onSale = activeSize ? !!(activeSize.onSale && activeSize.salePrice > 0) : !!product.onSale;

  const discountPercentage = comparePrice && currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : 0;

  const isOutOfStock = () => {
    if (activeSize) return activeSize.stock <= 0;
    if (sizes.length > 0) return sizes.every(s => s.stock <= 0);
    return (product.stock || 0) <= 0;
  };

  const generateWhatsAppMessage = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const productUrl = `${baseUrl}/products/${product.slug || product._id}`;

    let message = `🛍️ *Order Inquiry - Naksh Studio*\n\n`;
    message += `*Product:* ${product.name}\n`;
    message += `*SKU:* ${product.productSku || product.sku || 'N/A'}\n`;
    message += `*Category:* ${product.category?.name || 'N/A'}\n`;

    if (activeSize) {
      message += `*Size:* ${activeSize.size}\n`;
    }
    message += `*Price:* Rs ${currentPrice}\n`;

    if (selectedColor) {
      message += `*Color:* ${selectedColor}\n`;
    }

    message += `*Quantity:* ${quantity}\n`;
    message += `*Total:* Rs ${currentPrice * quantity}\n\n`;

    if (product.material) {
      message += `*Material:* ${product.material}\n`;
    }

    message += `*Product Link:* ${productUrl}\n\n`;
    message += `Please confirm availability and provide delivery details. Thank you! 🙏`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    const whatsappNumber = '03181058796';
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const needsSizeSelection = sizes.length > 0 && !activeSize;

  return (
    <div className="space-y-8">
      {/* Price Section */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-black text-text tracking-tighter">
            Rs {currentPrice}
          </span>
          {comparePrice && (
            <span className="text-xl text-text opacity-40 line-through font-medium">
              Rs {comparePrice}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {discountPercentage > 0 && (
            <span className="text-[10px] font-black bg-red-50 text-red-500 px-2 py-1 uppercase rounded-sm">
              -{discountPercentage}% OFF
            </span>
          )}
          {onSale && (
            <span className="text-[10px] font-black bg-green-50 text-green-600 px-2 py-1 uppercase rounded-sm">
              ON SALE
            </span>
          )}
          {product.trending && (
            <span className="text-[10px] font-black bg-red-50 text-red-500 px-2 py-1 uppercase rounded-sm">
              🔥 TRENDING
            </span>
          )}
        </div>

        {sizes.length > 0 && (
          <p className="text-[10px] text-text opacity-60 uppercase tracking-widest">
            {sizes.length} size{sizes.length > 1 ? 's' : ''} available
          </p>
        )}
      </div>

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <h3 className="text-[10px] uppercase tracking-widest font-black mb-3 text-text opacity-60">
            {product.garmentType === 'trouser' ? 'Select Waist Size *' : 'Select Size *'}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => {
              const sizeOnSale = size.onSale && size.salePrice > 0;
              return (
                <button
                  key={size.size}
                  type="button"
                  onClick={() => setSelectedSize(size.size)}
                  disabled={size.stock <= 0}
                  className={`
                    border rounded-md p-3 text-center transition-all text-sm font-black uppercase tracking-tight
                    ${selectedSize === size.size
                      ? 'border-text bg-text text-card-bg'
                      : 'border-accent-dim hover:border-text'
                    }
                    ${size.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div>{size.size}</div>
                  <div className="text-[10px] opacity-60 mt-1">
                    Rs {sizeOnSale ? size.salePrice : size.price}
                  </div>
                  {sizeOnSale && (
                    <div className="text-[8px] opacity-50 line-through">
                      Rs {size.comparePrice > 0 ? size.comparePrice : size.price}
                    </div>
                  )}
                  {size.stock <= 0 && (
                    <div className="text-[8px] text-red-500 font-bold mt-1">Out</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="text-[10px] uppercase tracking-widest font-black mb-3 text-text opacity-60">
            Select Color
          </h3>
          <div className="flex gap-3">
            {product.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color.name)}
                className={`
                  w-10 h-10 rounded-full border-2 transition-all
                  ${selectedColor === color.name
                    ? 'border-text scale-110'
                    : 'border-accent-dim hover:border-text'
                  }
                `}
                style={{ backgroundColor: color.hexCode }}
                title={color.name}
              />
            ))}
          </div>
          {selectedColor && (
            <p className="text-[10px] text-text opacity-60 mt-2">
              Selected: {selectedColor}
            </p>
          )}
        </div>
      )}

      {/* Quantity Selection */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-black mb-3 text-text opacity-60">
          Quantity
        </h3>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 border border-accent-dim rounded-md flex items-center justify-center hover:border-text transition-colors text-text font-black"
          >
            −
          </button>
          <span className="text-lg font-black text-text min-w-[2rem] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 border border-accent-dim rounded-md flex items-center justify-center hover:border-text transition-colors text-text font-black"
          >
            +
          </button>
        </div>
      </div>

      {/* Total Price */}
      <div className="bg-card-bg border border-accent-dim rounded-md p-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-widest font-black text-text opacity-60">
            Total Amount
          </span>
          <span className="text-2xl font-black text-text">
            Rs {currentPrice * quantity}
          </span>
        </div>
      </div>

      {/* WhatsApp Order Button */}
      <button
        type="button"
        onClick={handleWhatsAppOrder}
        disabled={isOutOfStock() || needsSizeSelection}
        className={`
          w-full py-4 px-6 text-[11px] uppercase font-black tracking-[0.3em] rounded-md transition-all flex items-center justify-center gap-3
          ${isOutOfStock() || needsSizeSelection
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white'
          }
        `}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
        </svg>
        {isOutOfStock()
          ? 'Out of Stock'
          : needsSizeSelection
            ? 'Select Size First'
            : 'Order via WhatsApp'
        }
      </button>

      {/* Info Text */}
      <p className="text-[9px] text-text opacity-60 text-center leading-relaxed">
        Click to send order details via WhatsApp. We'll confirm availability and arrange delivery.
      </p>
    </div>
  );
}
