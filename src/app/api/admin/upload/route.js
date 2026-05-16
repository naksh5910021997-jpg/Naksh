// app/api/admin/upload/route.js

import { NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

// POST - Upload image to Cloudinary (WITHOUT AUTH)
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'products';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await uploadImage(base64, folder);

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete image from Cloudinary (WITH AUTH)
async function deleteImageHandler(request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { success: false, message: 'Public ID is required' },
        { status: 400 }
      );
    }

    await deleteImage(publicId);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { success: false, message: 'Delete failed', error: error.message },
      { status: 500 }
    );
  }
}

export const DELETE = (request) => authMiddleware(deleteImageHandler, true)(request);