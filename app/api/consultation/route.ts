import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const data = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const name = clean(data.name, 120);
  const email = clean(data.email, 200);
  const company = clean(data.company, 160);
  const message = clean(data.message, 4000);

  if (!name || !EMAIL_PATTERN.test(email) || !company || message.length < 10) {
    return NextResponse.json(
      { error: 'Name, work email, company, and a short description of the project are required.' },
      { status: 400 }
    );
  }

  try {
    await db.collection('consultationRequests').add({
      name,
      email,
      company,
      message,
      source: 'website',
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Consultation request save failed:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'We could not save your request. Please try again.' },
      { status: 500 }
    );
  }

  const to = process.env.CONSULTATION_TO_EMAIL;
  const from = process.env.CONSULTATION_FROM_EMAIL;
  if (to && from && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from,
        to,
        replyTo: email,
        subject: `Consultation request from ${company}`,
        text: `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message}`,
      });
    } catch (error) {
      console.error('Consultation email failed:', error instanceof Error ? error.message : error);
    }
  }

  return NextResponse.json({ ok: true });
}
