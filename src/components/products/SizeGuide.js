import { getEffectiveSizePrice, getEffectiveSizeComparePrice } from '@/lib/pricing';

export default function SizeGuide({ sizes = [], garmentType, sizeType }) {
  if (sizes.length === 0) return null;

  return (
    <details open className="group border-y border-accent-dim">
      <summary className="flex justify-between items-center py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-text">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
            <path d="M3 17 17 3l4 4L7 21z" />
            <path d="m7 13 2 2M10 10l1.5 1.5M13 7l2 2" />
          </svg>
          Size Guide
        </span>
        <span className="text-text text-lg leading-none transition-transform group-open:rotate-45">+</span>
      </summary>

      <div className="pb-6 overflow-x-auto">
        <table className="w-full text-left border border-accent-dim">
          <thead className="bg-card-bg">
            <tr className="text-[10px] uppercase tracking-widest font-black text-text opacity-80">
              <th className="px-4 py-3 border-b border-accent-dim">
                {garmentType === 'trouser' && sizeType !== 'kids' ? 'Waist Size' : 'Size'}
              </th>
              <th className="px-4 py-3 border-b border-accent-dim">Price</th>
              <th className="px-4 py-3 border-b border-accent-dim">Stock</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => {
              const comparePrice = getEffectiveSizeComparePrice(size);
              const inStock = size.stock > 0;
              return (
                <tr key={size.size} className="text-[11px] font-bold text-text border-b border-accent-dim last:border-b-0">
                  <td className="px-4 py-2.5 uppercase tracking-widest">{size.size}</td>
                  <td className="px-4 py-2.5">
                    Rs {getEffectiveSizePrice(size)}
                    {comparePrice && (
                      <span className="ml-2 text-[10px] opacity-50 line-through">Rs {comparePrice}</span>
                    )}
                  </td>
                  <td className={`px-4 py-2.5 uppercase text-[10px] tracking-widest ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                    {inStock ? 'In Stock' : 'Sold Out'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
