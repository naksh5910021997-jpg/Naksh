import Link from 'next/link';
import Image from 'next/image';
import { getBundleImages, getBundleSummary } from '@/lib/bundle-pricing';

// Combo tile for listings: both product photos (or the combo photo), the
// lowest combo price and the biggest saving across its size options.
export default function BundleCard({ bundle }) {
  const images = getBundleImages(bundle);
  const { fromPrice, maxSavings, maxSavingsPercent, inStock, options } = getBundleSummary(bundle);
  // Separate price of the cheapest option, shown struck through.
  const cheapest = options.find((o) => o.price === fromPrice);

  return (
    <Link href={`/bundles/${bundle.slug}`} className="group block bg-card-bg font-sans">
      <div className="relative overflow-hidden border border-accent-dim group-hover:border-text transition-colors duration-500 rounded-md">
        <div className="relative aspect-[3/4] overflow-hidden bg-main-bg flex">
          {images.length === 1 ? (
            <Image src={images[0].url} alt={images[0].alt} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 25vw" />
          ) : (
            images.map((img) => (
              <div key={img.url} className="relative flex-1 overflow-hidden">
                <Image src={img.url} alt={img.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 25vw, 12vw" />
              </div>
            ))
          )}

          <div className="absolute top-3 left-3">
            <span className="bg-text text-card-bg text-[8px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm">
              Combo
            </span>
          </div>
          {maxSavings > 0 && (
            <div className="absolute top-3 right-3">
              <span className="bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm">
                Save {maxSavingsPercent}%
              </span>
            </div>
          )}
        </div>

        <div className="py-5 px-1">
          <p className="text-[10px] text-text opacity-60 uppercase tracking-widest font-medium mb-1">
            T-Shirt + Trouser
          </p>
          <h3 className="text-sm font-bold uppercase tracking-tight mb-3 line-clamp-1 group-hover:underline underline-offset-4 decoration-1 text-text">
            {bundle.title}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-text">
              {options.length > 1 ? 'From ' : ''}Rs {fromPrice}
            </span>
            {cheapest && cheapest.separatePrice > cheapest.price && (
              <span className="text-xs text-text opacity-40 line-through font-light">Rs {cheapest.separatePrice}</span>
            )}
          </div>
          {maxSavings > 0 && (
            <p className="text-[10px] text-green-600 uppercase tracking-widest font-bold mt-1">
              Save up to Rs {maxSavings}
            </p>
          )}
          {!inStock && (
            <p className="text-[9px] text-red-500 uppercase tracking-widest font-bold mt-2">Out of Stock</p>
          )}
        </div>
      </div>
    </Link>
  );
}
