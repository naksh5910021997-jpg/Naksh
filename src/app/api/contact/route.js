import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { authMiddleware } from '@/middleware/auth';
import { isMailConfigured, sendMail } from '@/lib/mailer';
import { BUSINESS } from '@/lib/seo';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST - Submit a contact query (Public)
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Please fill in your name, email and message.' },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { success: false, message: 'Your message is too long.' },
        { status: 400 }
      );
    }

    await connectDB();
    const saved = await ContactMessage.create({ name, email, phone, subject, message });

    // The query is already saved, so a mail failure doesn't fail the request.
    if (isMailConfigured()) {
      try {
        await sendMail({
          to: process.env.CONTACT_TO || BUSINESS.email,
          replyTo: email,
          subject: `[Contact] ${subject || `Message from ${name}`}`,
          text: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone || '-'}`,
            `Subject: ${subject || '-'}`,
            '',
            message,
          ].join('\n'),
        });
        saved.emailSent = true;
        await saved.save();
      } catch (mailError) {
        console.error('Contact email error:', mailError);
      }
    }

    return NextResponse.json(
      { success: true, message: 'Thank you! Your message has been sent. We’ll get back to you soon.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact submit error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again or message us on WhatsApp.' },
      { status: 500 }
    );
  }
}

// GET - List contact queries (Admin only)
async function listMessages() {
  try {
    await connectDB();
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(500).lean();
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get contact messages error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = (request) => authMiddleware(listMessages, true)(request);
