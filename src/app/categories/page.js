import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

async function getCategories() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="bg-main-bg min-h-screen pt-20 flex flex-col font-sans">
      <Navbar />
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text tracking-tight">All Categories</h1>
          <p className="text-text opacity-60 mt-2">Explore our collection by categories.</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20 bg-card-bg rounded-lg border border-accent-dim">
            <p className="text-text opacity-60">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category._id} href={`/categories/${category.slug}`} className="group">
                <div className="bg-card-bg border border-accent-dim p-8 rounded-lg hover:border-text hover:shadow-soft transition-all duration-300 h-full">
                  <h2 className="text-xl font-bold text-text group-hover:opacity-80 transition mb-3">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-text opacity-60 text-sm line-clamp-2 mb-6">{category.description}</p>
                  )}
                  <div className="flex items-center text-text text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    View Collection <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}