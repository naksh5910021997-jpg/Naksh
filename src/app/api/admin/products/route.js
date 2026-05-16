import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { authMiddleware } from '@/middleware/auth';
import { deleteMultipleImages, uploadImage } from '@/lib/cloudinary';

// GET - Get all products (Admin)
async function getProducts(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');

    let query = {};
    if (status) query.status = status;

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// route.js mein createProduct function ko aise update karein:
async function createProduct(request) {
  try {
    await connectDB();
    const data = await request.json();

    // 1. Data Cleaning: Ensure numbers are actually numbers
    if (data.price) data.price = Number(data.price);
    if (data.comparePrice) data.comparePrice = Number(data.comparePrice);

    // 2. Slug Generation
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7); // Unique suffix

    // 3. Category Fix: Agar frontend se object aa raha hai toh sirf ID nikalein
    if (data.category && typeof data.category === 'object') {
      data.category = data.category._id;
    }

    const product = await Product.create({
      ...data,
      slug,
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("DETAILED_ERROR:", error); // Terminal mein check karein

    // Specific validation error message bhejien
    return NextResponse.json({
      success: false,
      message: error.message,
      error: error.errors // Yeh aapko batayega kaunsi field missing hai
    }, { status: 400 }); // Status 400 behtar hai agar data galat ho
  }
}

// PUT - Update product (Admin)
async function updateProduct(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Update slug if name changed
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

async function deleteProduct(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // --- Image ID Collection ---
    const publicIds = [];

    // 1. Main images
    if (product.images?.length > 0) {
      product.images.forEach(img => {
        if (img.publicId) publicIds.push(img.publicId);
      });
    }

    // 2. Color images
    if (product.colors?.length > 0) {
      product.colors.forEach(color => {
        color.images?.forEach(img => {
          if (img.publicId) publicIds.push(img.publicId);
        });
      });
    }

    // --- CONSOLE LOG FOR VERIFICATION ---
    console.log("-----------------------------------------");
    console.log(`🗑️ Deleting Product: ${product.name}`);
    console.log(`📸 Images found to delete: ${publicIds.length}`);
    console.log(`🆔 Public IDs:`, publicIds);
    console.log("-----------------------------------------");

    // Delete from Cloudinary
    if (publicIds.length > 0) {
      // Yahan hum result ko await kar ke log karwa sakte hain
      const cloudinaryResult = await deleteMultipleImages(publicIds);
      console.log("✅ Cloudinary Deletion Result:", cloudinaryResult);
    } else {
      console.log("ℹ️ No images found in Cloudinary for this product.");
    }

    // Delete from DB
    await Product.findByIdAndDelete(id);
    console.log(`🚀 Product ${id} deleted from MongoDB.`);

    return NextResponse.json({
      success: true,
      message: 'Product and associated images deleted successfully',
      deletedImages: publicIds.length,
    });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Export with auth middleware
export const GET = (request) => authMiddleware(getProducts, true)(request);
export const POST = (request) => authMiddleware(createProduct, true)(request);
export const PUT = (request) => authMiddleware(updateProduct, true)(request);
export const DELETE = (request) => authMiddleware(deleteProduct, true)(request);