'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images, productName }) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-main-bg border border-accent-dim rounded-md flex items-center justify-center">
        <span className="text-[10px] uppercase tracking-widest text-text opacity-60 font-bold">
          No Visuals Available
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 font-sans">

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="order-2 md:order-1 flex md:flex-col gap-3 w-full md:w-20">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-[3/4] md:w-20 overflow-hidden transition-all duration-300 border rounded-sm ${
                selectedImage === index
                  ? 'border-text opacity-100'
                  : 'border-transparent opacity-40 hover:opacity-80 hover:border-accent-dim'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="order-1 md:order-2 flex-grow relative aspect-[3/4] bg-main-bg border border-accent-dim rounded-md group cursor-zoom-in">
        <Image
          src={images[selectedImage].url}
          alt={images[selectedImage].alt || productName}
          fill
          className="object-cover transition-all duration-700 rounded-md"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Image Count Badge */}
        <div className="absolute bottom-6 right-6 bg-text text-card-bg text-[9px] font-mono px-2 py-1 tracking-widest uppercase rounded-sm">
          {selectedImage + 1} / {images.length}
        </div>
      </div>

    </div>
  );
}