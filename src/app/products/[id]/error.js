'use client';

import { startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductError({ reset }) {
  const router = useRouter();

  // refresh() re-fetches the server component; reset() clears the error state
  const retry = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <div className="bg-main-bg min-h-screen flex flex-col justify-center items-center font-sans px-6 text-center">
      <h1 className="text-3xl font-black text-text">SOMETHING WENT WRONG</h1>
      <p className="mt-3 text-xs tracking-widest text-text opacity-60">We couldn&apos;t load this piece. Please try again.</p>
      <div className="mt-6 flex gap-6">
        <button type="button" onClick={retry} className="underline text-xs tracking-widest text-text">
          TRY AGAIN
        </button>
        <Link href="/products" className="underline text-xs tracking-widest text-text">BACK TO COLLECTION</Link>
      </div>
    </div>
  );
}
