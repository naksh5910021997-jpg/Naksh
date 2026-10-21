import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Bundle from '@/models/Bundle';
import { authMiddleware } from '@/middleware/auth';
import { normalizeBundleData } from '@/lib/bundle-admin';
import { deleteImage } from '@/lib/cloudinary';

const invalidId = () =>
  NextResponse.json({ success: false, message: 'Invalid combo ID' }, { status: 400 });
const notFound = () =>
  NextResponse.json({ success: false, message: 'Combo not found' }, { status: 404 });

// GET - One combo for the edit form (Admin only)
async function getBundle(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return invalidId();

    await connectDB();
    const bundle = await Bundle.findById(id).lean();
    if (!bundle) return notFound();
    return NextResponse.json({ success: true, data: bundle });
  } catch (error) {
    console.error('Get bundle error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Replace a combo's details (Admin only)
async function updateBundle(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return invalidId();

    await connectDB();
    const bundle = await Bundle.findById(id);
    if (!bundle) return notFound();

    const body = await request.json().catch(() => ({}));
    let data;
    try {
      data = await normalizeBundleData(body, id);
    } catch (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const oldImageId = bundle.image?.publicId;
    bundle.set({ ...data, image: data.image || undefined, startsAt: data.startsAt || undefined, endsAt: data.endsAt || undefined });
    await bundle.save();

    // The old combo photo was replaced or removed, so clean it up in Cloudinary.
    if (oldImageId && oldImageId !== bundle.image?.publicId) {
      deleteImage(oldImageId).catch((error) => console.error('Delete old bundle image error:', error));
    }

    return NextResponse.json({ success: true, data: bundle });
  } catch (error) {
    console.error('Update bundle error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a combo and its photo (Admin only). The products stay untouched.
async function deleteBundle(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return invalidId();

    await connectDB();
    const bundle = await Bundle.findByIdAndDelete(id);
    if (!bundle) return notFound();

    if (bundle.image?.publicId) {
      await deleteImage(bundle.image.publicId).catch((error) => console.error('Delete bundle image error:', error));
    }
    return NextResponse.json({ success: true, message: 'Combo deleted successfully' });
  } catch (error) {
    console.error('Delete bundle error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = (request, context) => authMiddleware(getBundle, true)(request, context);
export const PUT = (request, context) => authMiddleware(updateBundle, true)(request, context);
export const DELETE = (request, context) => authMiddleware(deleteBundle, true)(request, context);
