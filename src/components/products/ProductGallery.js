'use client';

import { useRef, useState } from 'react';

const SWIPE_THRESHOLD = 40;
import Image from 'next/image';

export default function ProductGallery({ images, productName }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const touchStart = useRef(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-main-bg border border-accent-dim rounded-md flex items-center justify-center">
        <span className="text-[10px] uppercase tracking-widest text-text opacity-60 font-bold">
          No Visuals Available
        </span>
      </div>
    );
  }

  const goTo = (index) => {
    setSelectedImage((index + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current || images.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    // Ignore mostly-vertical gestures so page scrolling still works
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    goTo(selectedImage + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 font-sans">

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="order-2 md:order-1 flex md:flex-col gap-3 w-full md:w-20 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(index)}
              aria-label={`Show image ${index + 1}`}
              className={`relative shrink-0 aspect-[3/4] w-16 md:w-20 overflow-hidden transition-all duration-300 border rounded-sm ${
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
      <div
        className="order-1 md:order-2 flex-grow relative aspect-[3/4] bg-main-bg border border-accent-dim rounded-md group cursor-zoom-in touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[selectedImage].url}
          alt={images[selectedImage].alt || productName}
          fill
          className="object-cover transition-all duration-700 rounded-md"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(selectedImage - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-card-bg/80 text-text text-lg"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(selectedImage + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-card-bg/80 text-text text-lg"
            >
              ›
            </button>
          </>
        )}

        {/* Image Count Badge */}
        <div className="absolute bottom-6 right-6 bg-text text-card-bg text-[9px] font-mono px-2 py-1 tracking-widest uppercase rounded-sm">
          {selectedImage + 1} / {images.length}
        </div>
      </div>

    </div>
  );
}