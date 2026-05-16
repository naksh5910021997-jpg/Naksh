import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { authMiddleware } from '@/middleware/auth';

async function deleteCategory(request, { params }) {
  try {
    await connectDB();

    // Folder ka naam [id] hai, isliye params.id milega
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is missing' },
        { status: 400 }
      );
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Export with auth middleware
export const DELETE = (request, context) => authMiddleware((req) => deleteCategory(req, context), true)(request);