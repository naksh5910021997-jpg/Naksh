// components/products/WhatsAppOrderButton.js
'use client';

import { useState } from 'react';

export default function WhatsAppOrderButton({ product }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Helper functions
  const getProductPrice = (product) => {
    if (product.basePrice) return product.basePrice;
    if (product.sizes && product.sizes.length > 0) {
      const prices = product.sizes.filter(size => size.price > 0).map(size => size.price);
      if (prices.length > 0) return Math.min(...prices);
    }
    return product.price || 0;
  };

  const getSelectedSizePrice = () => {
    if (!selectedSize || !product.sizes) return getProductPrice(product);
    const size = product.sizes.find(s => s.size === selectedSize);
    return size ? size.price : getProductPrice(product);
  };

  const generateWhatsAppMessage = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const productUrl = `${baseUrl}/products/${product.slug || product._id}`;

    let message = `🛍️ *Order Inquiry - Naksh Studio*\n\n`;
    message += `*Product:* ${product.name}\n`;
    message += `*SKU:* ${product.sku || 'N/A'}\n`;
    message += `*Category:* ${product.category?.name || 'N/A'}\n`;

    if (selectedSize) {
      message += `*Size:* ${selectedSize}\n`;
      message += `*Price:* Rs ${getSelectedSizePrice()}\n`;
    } else {
      message += `*Price:* Rs ${getProductPrice(product)}\n`;
    }

    if (selectedColor) {
      message += `*Color:* ${selectedColor}\n`;
    }

    message += `*Quantity:* ${quantity}\n`;
    message += `*Total:* Rs ${getSelectedSizePrice() * quantity}\n\n`;

    if (product.material) {
      message += `*Material:* ${product.material}\n`;
    }

    message += `*Product Link:* ${productUrl}\n\n`;
    message += `Please confirm availability and provide delivery details. Thank you! 🙏`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    // Your WhatsApp number (with country code, without +)
    const whatsappNumber = '03181058796'; // Replace with your actual number
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    window.open(whatsappUrl, '_blank');
  };

  const isOutOfStock = () => {
    if (selectedSize && product.sizes) {
      const size = product.sizes.find(s => s.size === selectedSize);
      return size ? size.stock <= 0 : false;
    }

    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.every(size => size.stock <= 0);
    }

    return (product.stock || 0) <= 0;
  };

  return (
    <div className="space-y-6 border-t border-accent-dim pt-8">
      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <h3 className="text-[10px] uppercase tracking-widest font-black mb-3 text-text opacity-60">
            Select Size *
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {product.sizes.map((size) => (
              <button
                key={size.size}
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
                <div className="text-[10px] opacity-60 mt-1">Rs {size.price}</div>
                {size.stock <= 0 && (
                  <div className="text-[8px] text-red-500 font-bold mt-1">Out</div>
                )}
              </button>
            ))}
          </div>
          {selectedSize && (
            <p className="text-[10px] text-text opacity-60 mt-2">
              Selected: {selectedSize} - Rs {getSelectedSizePrice()}
            </p>
          )}
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
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 border border-accent-dim rounded-md flex items-center justify-center hover:border-text transition-colors text-text font-black"
          >
            −
          </button>
          <span className="text-lg font-black text-text min-w-[2rem] text-center">
            {quantity}
          </span>
          <button
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
            Rs {getSelectedSizePrice() * quantity}
          </span>
        </div>
      </div>

      {/* WhatsApp Order Button */}
      <button
        onClick={handleWhatsAppOrder}
        disabled={isOutOfStock() || (product.sizes && product.sizes.length > 0 && !selectedSize)}
        className={`
          w-full py-4 px-6 text-[11px] uppercase font-black tracking-[0.3em] rounded-md transition-all flex items-center justify-center gap-3
          ${isOutOfStock() || (product.sizes && product.sizes.length > 0 && !selectedSize)
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
          : (product.sizes && product.sizes.length > 0 && !selectedSize)
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