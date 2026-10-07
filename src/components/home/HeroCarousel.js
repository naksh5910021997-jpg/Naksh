'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 50;

// Full-width banner slider: auto-advances, pauses on hover/focus, supports
// arrows, dots, keyboard and touch swipe. Autoplay is off for reduced motion.
export default function HeroCarousel({ slides }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef(null);
  const count = slides.length;

  const goTo = useCallback((index) => setCurrent((index + count) % count), [count]);
  const next = useCallback(() => setCurrent((index) => (index + 1) % count), [count]);
  const prev = useCallback(() => setCurrent((index) => (index - 1 + count) % count), [count]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || count < 2) return undefined;
    const timer = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [current, paused, reducedMotion, count, next]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD) prev();
    else if (delta < -SWIPE_THRESHOLD) next();
    touchStartX.current = null;
    setPaused(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  return (
    <div
      className="relative w-full aspect-video max-h-[calc(100svh-5rem)] overflow-hidden group"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className="relative w-full h-full shrink-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            aria-hidden={index !== current}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-card-bg/80 text-text hidden md:flex items-center justify-center shadow-md md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next banner"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-card-bg/80 text-text hidden md:flex items-center justify-center shadow-md md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to banner ${index + 1}`}
                aria-current={index === current}
                className={`h-2 rounded-full shadow transition-all ${index === current ? 'w-6 bg-text' : 'w-2 bg-card-bg/90 hover:bg-card-bg'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
