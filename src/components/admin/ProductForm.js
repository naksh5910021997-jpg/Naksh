'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ProductForm({ product = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState('core');
  const editId = searchParams.get('edit');
  const isEditing = !!editId;
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    basePrice: product?.basePrice || '', // Changed from price to basePrice
    category: product?.category?._id || '',
    productType: product?.productType || 'half-sleeve',
    material: product?.material || '100% Cotton',
    fabricType: product?.fabricType || 'cotton',
    gsm: product?.gsm || '',
    fit: product?.fit || 'regular',
    neckline: product?.neckline || 'round',
    sleeveLength: product?.sleeveLength || 'short',
    pattern: product?.pattern || 'solid',
    brand: product?.brand || 'Naksh',
    madeIn: product?.madeIn || 'India',
    status: product?.status || 'active',
    featured: product?.featured || false,
    trending: product?.trending || false,
    productSku: product?.productSku || '', // Changed from sku to productSku
    barcode: product?.barcode || '',
    images: product?.images || [],
    // Updated sizes structure with individual pricing
    sizes: product?.sizes || [
      { size: 'S', stock: 0, price: '', comparePrice: '', salePrice: '', onSale: false, sku: '' },
      { size: 'M', stock: 0, price: '', comparePrice: '', salePrice: '', onSale: false, sku: '' },
      { size: 'L', stock: 0, price: '', comparePrice: '', salePrice: '', onSale: false, sku: '' },
      { size: 'XL', stock: 0, price: '', comparePrice: '', salePrice: '', onSale: false, sku: '' },
    ],
    colors: product?.colors || [],
    features: product?.features || [],
    careInstructions: product?.careInstructions || [
      'Machine wash cold',
      'Do not bleach',
      'Tumble dry low',
      'Iron on low heat',
    ],
    weight: product?.weight || { value: '', unit: 'g' },
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
    keywords: product?.keywords || [],
    lowStockThreshold: product?.lowStockThreshold || 5,
  });

  // Fetch product data for editing
  useEffect(() => {
    if (isEditing) {
      fetchProductData();
    }
    fetchCategories();
  }, [editId]);
  // ProductForm.js (Selected Parts)

  // 1. Fetch logic fix (Auto-fill issue)
  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${editId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const p = result.data;
        // Map ALL fields carefully
        setFormData({
          name: p.name || '',
          description: p.description || '',
          shortDescription: p.shortDescription || '',
          basePrice: p.basePrice || '',
          category: p.category?._id || p.category || '',
          productType: p.productType || 'half-sleeve',
          material: p.material || '',
          fabricType: p.fabricType || 'cotton',
          gsm: p.gsm || '',
          fit: p.fit || 'regular',
          neckline: p.neckline || 'round',
          sleeveLength: p.sleeveLength || 'short',
          pattern: p.pattern || 'solid',
          brand: p.brand || 'Naksh',
          madeIn: p.madeIn || 'India',
          status: p.status || 'active',
          featured: p.featured || false,
          trending: p.trending || false,
          productSku: p.productSku || '', // Yeh "pro-1" load karega
          barcode: p.barcode || '',
          images: p.images || [], // Cloudinary images
          sizes: p.sizes?.length ? p.sizes : formData.sizes,
          colors: p.colors || [],
          features: p.features || [],
          careInstructions: p.careInstructions || [],
          weight: p.weight || { value: '', unit: 'g' },
          metaTitle: p.metaTitle || '',
          metaDescription: p.metaDescription || '',
          keywords: p.keywords || [],
          lowStockThreshold: p.lowStockThreshold || 5,
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) { console.error(error); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  // Size management functions
  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    if (field === 'stock' || field === 'price' || field === 'comparePrice' || field === 'salePrice') {
      newSizes[index][field] = value === '' ? '' : Number(value);
    } else {
      newSizes[index][field] = value;
    }
    setFormData({ ...formData, sizes: newSizes });
  };

  const addSize = () => {
    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    const usedSizes = formData.sizes.map(s => s.size);
    const nextSize = availableSizes.find(size => !usedSizes.includes(size));

    if (nextSize) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, {
          size: nextSize,
          stock: 0,
          price: '',
          comparePrice: '',
          salePrice: '',
          onSale: false,
          sku: ''
        }]
      });
    }
  };

  const removeSize = (index) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: newSizes });
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Double request rokne ke liye check
    if (loading) return;

    setLoading(true);
    const token = localStorage.getItem('token');

    // 2. Validation
    const hasValidSize = formData.sizes.some(size => Number(size.price) > 0);
    if (!hasValidSize) {
      alert("Please set price for at least one size");
      setLoading(false);
      return;
    }

    if (formData.images.length === 0) {
      alert("Please upload at least one image");
      setLoading(false);
      return;
    }

    // 3. Data Cleaning (Ensuring productSku is not empty if required)
    const submissionData = {
      ...formData,
      basePrice: Number(formData.basePrice),
      gsm: formData.gsm ? Number(formData.gsm) : undefined,
      // Agar SKU khali hai to use null ya unique string dein
      productSku: formData.productSku.trim() || `SKU-${Date.now()}`,
      category: typeof formData.category === 'object' ? formData.category._id : formData.category,
      weight: {
        value: formData.weight.value ? Number(formData.weight.value) : undefined,
        unit: formData.weight.unit || 'g',
      },
      sizes: formData.sizes
        .filter(size => Number(size.price) > 0)
        .map(size => ({
          ...size,
          stock: Number(size.stock) || 0,
          price: Number(size.price),
          comparePrice: size.comparePrice ? Number(size.comparePrice) : undefined,
          salePrice: size.salePrice ? Number(size.salePrice) : undefined,
        })),
    };

    // 4. Correct URL & Method for Edit vs Create
    // Edit ke liye humesha editId (jo searchParams se milta hai) use karein
    const url = isEditing ? `/api/admin/products?id=${editId}` : '/api/admin/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      if (data.success) {
        alert(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
        router.push('/admin/products');
        router.refresh();
      } else {
        // Agar yahan E11000 error aaye to iska matlab DB mein issue hai
        alert(`Error: ${data.message || 'Duplicate SKU found. Please change the SKU code.'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingImages(true);

    try {
      const token = localStorage.getItem('token');
      for (const file of files) {
        const dataF = new FormData();
        dataF.append('file', file);
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: dataF,
        });
        const data = await res.json();
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, { url: data.data.url, publicId: data.data.publicId, alt: prev.name }]
          }));
        }
      }
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = async (index, publicId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      const token = localStorage.getItem('token');

      // 1. Cloudinary se delete karne ke liye API call
      if (publicId) {
        const res = await fetch('/api/admin/upload', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ publicId }) // Body mein publicId bhej rahe hain
        });

        const data = await res.json();
        if (!data.success) {
          alert("Cloudinary delete failed: " + data.message);
          return; // Agar server se delete nahi hui to UI se bhi mat hatao
        }
      }

      // 2. UI State se remove karein
      const updatedImages = formData.images.filter((_, i) => i !== index);
      setFormData({ ...formData, images: updatedImages });

    } catch (error) {
      console.error("Delete Error:", error);
      alert("An error occurred while deleting the image.");
    }
  };
  // Color management functions (same as before)
  const handleAddColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { name: '', hexCode: '#000000', images: [] }]
    });
  };

  const handleRemoveColor = (index) => {
    const newColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: newColors });
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index][field] = value;
    setFormData({ ...formData, colors: newColors });
  };

  const tabs = [
    { id: 'core', label: 'Core Info', icon: '📋' },
    { id: 'pricing', label: 'Pricing & Sizes', icon: '💰' }, // Updated label
    { id: 'specs', label: 'Specifications', icon: '📏' },
    { id: 'media', label: 'Media', icon: '🖼️' },
    { id: 'colors', label: 'Colors', icon: '🎨' }, // Naya Tab
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
  ];

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50">
      {/* Header - same as before */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {isEditing ? 'Edit Product' : 'New Product'}
            </h1>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${formData.status === 'active' ? 'bg-green-100 text-green-700' :
              formData.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
              {formData.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation - same as before */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex -mb-px space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Core Info Tab - same as before but update SKU field */}
        {activeTab === 'core' && (
          <div className="space-y-8">
            {/* Basic Information - same as before */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Classic Cotton T-Shirt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="Brief description for product cards"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.shortDescription.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Detailed product description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none bg-white"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="productType"
                      value={formData.productType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none bg-white"
                    >
                      <option value="">Select type</option>
                      <option value="polo">Polo</option>
                      <option value="half-sleeve">Half Sleeve</option>
                      <option value="full-sleeve">Full Sleeve</option>
                      <option value="v-neck">V-Neck</option>
                      <option value="round-neck">Round Neck</option>
                      <option value="henley">Henley</option>
                      <option value="tank-top">Tank Top</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                      placeholder="Naksh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Made In
                    </label>
                    <input
                      type="text"
                      name="madeIn"
                      value={formData.madeIn}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Visibility - same as before */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Status & Visibility</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-7">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="trending"
                      checked={formData.trending}
                      onChange={handleChange}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <span className="text-sm text-gray-700">Trending</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Features - same as before */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Product Features</h2>
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...formData.features];
                        newFeatures[index] = e.target.value;
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                      placeholder="e.g. Breathable fabric"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newFeatures = formData.features.filter((_, i) => i !== index);
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      className="px-3 py-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      features: [...formData.features, '']
                    });
                  }}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  + Add Feature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UPDATED Pricing Tab - Now includes size-wise pricing */}
        {activeTab === 'pricing' && (
          <div className="space-y-8">
            {/* Base Price */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Base Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (Rs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="Starting price"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum/starting price for this product
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product SKU
                  </label>
                  <input
                    type="text"
                    name="productSku"
                    value={formData.productSku}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="PROD-12345"
                  />
                </div>
              </div>
            </div>

            {/* Size-wise Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">Size-wise Pricing</h2>
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  + Add Size
                </button>
              </div>

              <div className="space-y-4">
                {formData.sizes.map((sizeItem, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Size {sizeItem.size}</h3>
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (Rs) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={sizeItem.price}
                          onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Compare Price (Rs)
                        </label>
                        <input
                          type="number"
                          value={sizeItem.comparePrice}
                          onChange={(e) => handleSizeChange(index, 'comparePrice', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock
                        </label>
                        <input
                          type="number"
                          value={sizeItem.stock}
                          onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Size SKU
                        </label>
                        <input
                          type="text"
                          value={sizeItem.sku}
                          onChange={(e) => handleSizeChange(index, 'sku', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                          placeholder="SKU-S-001"
                        />
                      </div>
                    </div>

                    {/* Sale Settings per size */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sizeItem.onSale}
                            onChange={(e) => handleSizeChange(index, 'onSale', e.target.checked)}
                            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                          />
                          <span className="text-sm text-gray-700">On Sale</span>
                        </label>
                      </div>

                      {sizeItem.onSale && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sale Price (Rs)
                            </label>
                            <input
                              type="number"
                              value={sizeItem.salePrice}
                              onChange={(e) => handleSizeChange(index, 'salePrice', e.target.value)}
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {formData.sizes.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No sizes added yet. Click "Add Size" to start.
                  </p>
                )}
              </div>


              {/* Price Summary */}
              {formData.sizes.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Price Range Summary</h4>
                  <div className="text-sm text-blue-800">
                    {(() => {
                      const prices = formData.sizes.filter(s => s.price > 0).map(s => Number(s.price));
                      if (prices.length === 0) return "No prices set";
                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);
                      return minPrice === maxPrice
                        ? `Rs ${minPrice}`
                        : `Rs ${minPrice} - Rs ${maxPrice}`;
                    })()}
                  </div>
                  <div className="text-sm text-blue-800 mt-1">
                    <strong>Total Stock:</strong> {formData.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)} units
                  </div>
                </div>
              )}
            </div>

            {/* Barcode */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Product Identifiers</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  placeholder="1234567890123"
                />
              </div>
            </div>
          </div>
        )}

        {/* Specifications Tab - same as before */}
        {activeTab === 'specs' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Material & Construction</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="e.g. 100% Cotton"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fabric Type
                  </label>
                  <select
                    name="fabricType"
                    value={formData.fabricType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="cotton">Cotton</option>
                    <option value="polyester">Polyester</option>
                    <option value="blend">Blend</option>
                    <option value="linen">Linen</option>
                    <option value="silk">Silk</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GSM (100-300)
                  </label>
                  <input
                    type="number"
                    name="gsm"
                    value={formData.gsm}
                    onChange={handleChange}
                    min="100"
                    max="300"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="180"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Fit & Style</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fit
                  </label>
                  <select
                    name="fit"
                    value={formData.fit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="slim">Slim</option>
                    <option value="regular">Regular</option>
                    <option value="loose">Loose</option>
                    <option value="oversized">Oversized</option>
                    <option value="athletic">Athletic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Neckline
                  </label>
                  <select
                    name="neckline"
                    value={formData.neckline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="round">Round</option>
                    <option value="v-neck">V-Neck</option>
                    <option value="polo">Polo</option>
                    <option value="henley">Henley</option>
                    <option value="crew">Crew</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sleeve Length
                  </label>
                  <select
                    name="sleeveLength"
                    value={formData.sleeveLength}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="short">Short</option>
                    <option value="long">Long</option>
                    <option value="sleeveless">Sleeveless</option>
                    <option value="3/4">3/4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pattern
                  </label>
                  <select
                    name="pattern"
                    value={formData.pattern}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="solid">Solid</option>
                    <option value="striped">Striped</option>
                    <option value="printed">Printed</option>
                    <option value="checkered">Checkered</option>
                    <option value="graphic">Graphic</option>
                    <option value="plain">Plain</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Weight Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Product Weight</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight Value
                  </label>
                  <input
                    type="number"
                    value={formData.weight.value}
                    onChange={(e) => setFormData({
                      ...formData,
                      weight: { ...formData.weight, value: e.target.value }
                    })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight Unit
                  </label>
                  <select
                    value={formData.weight.unit}
                    onChange={(e) => setFormData({
                      ...formData,
                      weight: { ...formData.weight, unit: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Tab - same as before */}
        {activeTab === 'media' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 bg-gray-50">
                  <span className="text-3xl text-gray-400">+</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {formData.images.map((image, index) => (
                  <div key={index} className="relative aspect-square group">
                    <Image src={image.url} alt="Product" fill className="object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, image.publicId)} // publicId pass ho raha hai
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* // Main Content mein Colors ka Section */}
        {activeTab === 'colors' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">Product Colors</h2>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  + Add Color
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.colors.map((color, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Color Name (e.g. Navy Blue)"
                        value={color.name}
                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color.hexCode}
                          onChange={(e) => handleColorChange(index, 'hexCode', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-none"
                        />
                        <span className="text-xs text-gray-500 uppercase">{color.hexCode}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              {formData.colors.length === 0 && (
                <p className="text-center text-gray-500 py-4">No colors added yet.</p>
              )}
            </div>
          </div>
        )}
        {/* Inventory Tab - Updated */}
        {activeTab === 'inventory' && (
          <div className="space-y-8">
            {/* Stock Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Stock Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.sizes.map((sizeItem, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-lg font-semibold">{sizeItem.size}</div>
                    <div className="text-2xl font-bold text-blue-600">{sizeItem.stock || 0}</div>
                    <div className="text-sm text-gray-500">units</div>
                    {sizeItem.price > 0 && (
                      <div className="text-sm text-green-600 mt-1">Rs {sizeItem.price}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Total Stock</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formData.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Available Sizes</div>
                  <div className="text-2xl font-bold text-green-900">
                    {formData.sizes.filter(s => s.stock > 0).length}
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium">Low Stock Threshold</div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {formData.lowStockThreshold}
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Inventory Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  placeholder="5"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Get notified when stock falls below this number
                </p>
              </div>
            </div>

            {/* Care Instructions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Care Instructions</h2>
              <div className="space-y-3">
                {formData.careInstructions.map((instruction, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) => {
                        const newInstructions = [...formData.careInstructions];
                        newInstructions[index] = e.target.value;
                        setFormData({ ...formData, careInstructions: newInstructions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newInstructions = formData.careInstructions.filter((_, i) => i !== index);
                        setFormData({ ...formData, careInstructions: newInstructions });
                      }}
                      className="px-3 py-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      careInstructions: [...formData.careInstructions, '']
                    });
                  }}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  + Add Instruction
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab - same as before */}
        {activeTab === 'seo' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Search Engine Optimization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    maxLength={60}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="SEO optimized title (max 60 characters)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    maxLength={160}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none"
                    placeholder="SEO optimized description (max 160 characters)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.keywords.join(', ')}
                    onChange={(e) => {
                      const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                      setFormData({ ...formData, keywords });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate keywords with commas
                  </p>
                </div>
              </div>
            </div>

            {/* SEO Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium mb-6">Search Preview</h2>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-blue-600 text-lg mb-1">
                  {formData.metaTitle || formData.name || 'Product Title'}
                </div>
                <div className="text-green-700 text-sm mb-2">
                  https://yourstore.com/products/{formData.name.toLowerCase().replace(/\s+/g, '-')}
                </div>
                <div className="text-gray-600 text-sm">
                  {formData.metaDescription || formData.shortDescription || 'Product description will appear here...'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}