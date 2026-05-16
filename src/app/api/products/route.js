import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: 'active' };

    // Category filter
    if (searchParams.get('category')) {
      filter.category = searchParams.get('category');
    }

    // Product type filter
    if (searchParams.get('type')) {
      filter.productType = searchParams.get('type');
    }

    // Fit filter
    if (searchParams.get('fit')) {
      filter.fit = searchParams.get('fit');
    }

    // Pattern filter
    if (searchParams.get('pattern')) {
      filter.pattern = searchParams.get('pattern');
    }

    // Fabric type filter
    if (searchParams.get('fabric')) {
      filter.fabricType = searchParams.get('fabric');
    }

    // Price range filter
    if (searchParams.get('minPrice') || searchParams.get('maxPrice')) {
      filter.price = {};
      if (searchParams.get('minPrice')) {
        filter.price.$gte = parseFloat(searchParams.get('minPrice'));
      }
      if (searchParams.get('maxPrice')) {
        filter.price.$lte = parseFloat(searchParams.get('maxPrice'));
      }
    }

    // Special filters
    if (searchParams.get('featured') === 'true') {
      filter.featured = true;
    }

    if (searchParams.get('trending') === 'true') {
      filter.trending = true;
    }

    if (searchParams.get('onSale') === 'true') {
      filter.onSale = true;
    }

    // Rating filter
    if (searchParams.get('minRating')) {
      filter.rating = { $gte: parseFloat(searchParams.get('minRating')) };
    }

    // Search filter
    if (searchParams.get('search')) {
      const searchTerm = searchParams.get('search');
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { keywords: { $in: [new RegExp(searchTerm, 'i')] } },
        { material: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    let sort = { [sortBy]: sortOrder };

    // Special sort cases
    if (sortBy === 'popularity') {
      sort = { rating: -1, numReviews: -1, createdAt: -1 };
    } else if (sortBy === 'discount') {
      sort = { onSale: -1, createdAt: -1 };
    }

    // Execute queries
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}