import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="bg-main-bg min-h-screen flex flex-col justify-center items-center font-sans">
      <h1 className="text-4xl font-black text-text">PIECE NOT FOUND</h1>
      <Link href="/products" className="mt-4 underline text-xs tracking-widest text-text">BACK TO COLLECTION</Link>
    </div>
  );
}
