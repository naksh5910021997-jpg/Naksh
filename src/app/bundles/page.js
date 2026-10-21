import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import BundleCard from '@/components/bundles/BundleCard';
import { getLiveBundles } from '@/lib/bundles';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Combo Deals — T-Shirt & Trouser Sets',
  description: 'Save more with Naksh Shop combo deals: matching kids T-shirt and trouser sets at a special set price. Delivery across Karachi.',
  alternates: { canonical: '/bundles' },
};

export default async function BundlesPage() {
  let bundles = [];
  try {
    bundles = await getLiveBundles();
  } catch (error) {
    console.error('Bundles page error:', error);
  }

  return (
    <div className="bg-main-bg min-h-screen font-sans">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex items-center gap-4 mb-12">
          <h1 className="text-xs uppercase font-black tracking-[0.4em] text-text">Combo Deals</h1>
          <div className="h-[1px] flex-grow bg-accent-dim"></div>
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-text mb-4">Complete<br />The Set</h2>
        <p className="text-text opacity-60 max-w-md mb-12">
          A T-shirt and trouser picked to go together, at a set price that costs less than buying them separately.
        </p>

        {bundles.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-accent-dim rounded-md">
            <p className="text-xs text-text opacity-60 uppercase tracking-widest mb-4">No combo deals right now</p>
            <Link href="/products" className="text-[10px] uppercase font-bold tracking-widest border-b border-text pb-1 text-text">
              Shop all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
            {bundles.map((bundle) => <BundleCard key={bundle._id} bundle={bundle} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
