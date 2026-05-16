'use client';

import { useState } from 'react';

export default function AddToCartButton({ product }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      alert('SELECT SIZE');
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      alert('SELECT COLOR');
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      image: product.images[0]?.url,
    };

    console.log('Adding to cart:', cartItem);
    alert('ADDED TO BAG');
  };

  const labelStyles = "text-[10px] uppercase tracking-[0.2em] font-black text-text opacity-60 mb-4 block";

  return (
    <div className="space-y-10 py-6 font-sans">
      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className={labelStyles}>Select Size</label>
            <button className="text-[9px] uppercase tracking-widest underline underline-offset-4 opacity-50 hover:opacity-100 text-text">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((sizeObj, index) => (
              <button
                key={index}
                onClick={() => setSelectedSize(sizeObj.size)}
                disabled={sizeObj.stock === 0}
                className={`min-w-[60px] h-[45px] text-[11px] font-bold uppercase tracking-widest border transition-all duration-300 rounded-sm ${
                  selectedSize === sizeObj.size
                    ? 'border-text bg-text text-card-bg'
                    : sizeObj.stock > 0
                    ? 'border-accent-dim hover:border-text bg-card-bg text-text'
                    : 'border-accent-dim bg-main-bg text-text opacity-30 cursor-not-allowed line-through'
                }`}
              >
                {sizeObj.size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <label className={labelStyles}>Select Finish — {selectedColor || 'None'}</label>
          <div className="flex gap-4">
            {product.colors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(color.name)}
                className={`group relative p-1 border transition-all duration-300 rounded-sm ${
                  selectedColor === color.name ? 'border-text' : 'border-transparent'
                }`}
              >
                <div
                  className="w-8 h-8 border border-accent-dim rounded-sm"
                  style={{ backgroundColor: color.hexCode }}
                ></div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] uppercase font-bold tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-text">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex flex-col gap-4 pt-4">
        <label className={labelStyles}>Quantity</label>
        <div className="flex gap-4">
          <div className="flex items-center border border-accent-dim h-[55px] bg-card-bg rounded-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-full hover:bg-main-bg transition-colors text-lg text-text"
            >
              —
            </button>
            <span className="w-12 text-center text-xs font-black font-mono leading-none text-text">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-full hover:bg-main-bg transition-colors text-lg text-text"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-grow bg-text text-card-bg h-[55px] text-[11px] uppercase font-black tracking-[0.3em] hover:opacity-80 transition-all active:scale-[0.98] rounded-sm"
          >
            Add to Bag
          </button>
        </div>
      </div>

      {/* Shipping Note */}
      <p className="text-[9px] text-text opacity-60 uppercase tracking-widest font-medium">
        Standard Shipping: 2-4 Business Days <br />
        Free returns on all studio essentials.
      </p>
    </div>
  );
}