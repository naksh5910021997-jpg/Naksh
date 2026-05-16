import { NextResponse } from 'next/server'; // Fix for ReferenceError
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    let product = null;

    // 1. Try finding by ID if it's a valid MongoDB ObjectId
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      product = await Product.findById(id).populate('category', 'name slug');
    }

    // 2. If not found by ID, try finding by Slug
    if (!product) {
      product = await Product.findOne({ slug: id }).populate('category', 'name slug');
    }

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('SERVER API ERROR:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}