import { NextResponse } from 'next/server';
import { sendCryptoOrderEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const orderData = await req.json();

    // Send emails using the email utility function
    const result = await sendCryptoOrderEmail(orderData);

    if (!result.success) {
      throw new Error('Failed to send emails');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-crypto-emails route:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
} 