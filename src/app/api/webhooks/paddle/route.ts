import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const paddleWebhookEventSchema = z.object({
  event_id: z.string(),
  event_type: z.string(),
  occurred_at: z.string().optional(),
  data: z.object({
    id: z.string(),
    status: z.string().optional(),
    custom_data: z.object({
      user_id: z.string().uuid(),
    }).passthrough().nullable().optional(),
  }).passthrough(),
});

function parsePaddleSignature(signatureHeader: string): { timestamp: string; signatures: string[] } {
  const parts = signatureHeader.split(';');
  const timestamp = parts.find((part) => part.startsWith('ts='))?.slice(3);
  const signatures = parts
    .filter((part) => part.startsWith('h1='))
    .map((part) => part.slice(3))
    .filter((value) => value.length > 0);

  if (!timestamp || signatures.length === 0) {
    throw new Error('Invalid Paddle-Signature header format.');
  }

  return { timestamp, signatures };
}

function verifyPaddleSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const { timestamp, signatures } = parsePaddleSignature(signatureHeader);
  const timestampMs = Number(timestamp) * 1000;

  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    return false;
  }

  const payload = `${timestamp}:${rawBody}`;
  const expectedSignature = createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  return signatures.some((signature) => {
    try {
      const providedBuffer = Buffer.from(signature, 'hex');
      if (providedBuffer.length !== expectedBuffer.length) {
        return false;
      }
      return timingSafeEqual(providedBuffer, expectedBuffer);
    } catch {
      return false;
    }
  });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing PADDLE_WEBHOOK_SECRET.' }, { status: 500 });
  }

  const signatureHeader = request.headers.get('paddle-signature');

  if (!signatureHeader) {
    return NextResponse.json({ error: 'Missing Paddle-Signature header.' }, { status: 400 });
  }

  const rawBody = await request.text();

  if (!verifyPaddleSignature(rawBody, signatureHeader, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload.' }, { status: 400 });
  }

  const parsedEvent = paddleWebhookEventSchema.safeParse(parsedJson);

  if (!parsedEvent.success) {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }

  const event = parsedEvent.data;

  if (event.event_type !== 'transaction.completed') {
    return NextResponse.json({ received: true, ignored: true });
  }

  const userId = event.data.custom_data?.user_id;

  if (!userId) {
    return NextResponse.json({ error: 'Missing custom_data.user_id in transaction.completed payload.' }, { status: 400 });
  }

  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .upsert(
      {
        user_id: userId,
        is_pro: true,
      },
      { onConflict: 'user_id' }
    );

  if (profileError) {
    return NextResponse.json({ error: 'Failed to update profile Pro status.' }, { status: 500 });
  }

  const { error: subscriptionError } = await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_type: 'pro',
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (subscriptionError) {
    return NextResponse.json({ error: 'Failed to update subscription status.' }, { status: 500 });
  }

  return NextResponse.json({ received: true, upgraded: true });
}
