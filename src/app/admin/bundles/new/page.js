import BundleForm from '@/components/admin/BundleForm';

export default function NewBundlePage() {
  return (
    <div className="space-y-8 px-4 py-6 md:px-8 md:py-10">
      <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">New Combo</h1>
      <BundleForm />
    </div>
  );
}
