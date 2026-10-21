import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Bundle from '@/models/Bundle';
import { authMiddleware } from '@/middleware/auth';
import { normalizeBundleData } from '@/lib/bundle-admin';

const PRODUCT_FIELDS = 'name slug images sizes status garmentType';

// GET - List all combos with their products (Admin only)
async function listBundles() {
  try {
    await connectDB();
    const bundles = await Bundle.find()
      .populate('tshirt', PRODUCT_FIELDS)
      .populate('trouser', PRODUCT_FIELDS)
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: bundles });
  } catch (error) {
    console.error('Get bundles error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a combo (Admin only)
async function createBundle(request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    let data;
    try {
      data = await normalizeBundleData(body);
    } catch (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const bundle = await Bundle.create(data);
    return NextResponse.json({ success: true, data: bundle }, { status: 201 });
  } catch (error) {
    console.error('Create bundle error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = (request) => authMiddleware(listBundles, true)(request);
export const POST = (request) => authMiddleware(createBundle, true)(request);
