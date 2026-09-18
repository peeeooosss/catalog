import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['view', 'product_view', 'add_to_cart', 'whatsapp_click']);

export async function POST(request: Request) {
  const sql = getSql();
  if (!sql) return NextResponse.json({ ok: false }, { status: 503 });

  let body: { tenantId?: string; event?: string; productId?: number; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const tenantId = String(body.tenantId ?? '');
  const event = String(body.event ?? '');
  if (!tenantId || !ALLOWED.has(event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const productId = Number(body.productId);
  const sessionId = body.sessionId ? String(body.sessionId).slice(0, 64) : null;

  try {
    await sql`
      INSERT INTO analytics_events (tenant_id, event_type, product_id, session_id)
      VALUES (${tenantId}, ${event}, ${Number.isFinite(productId) && productId > 0 ? productId : null}, ${sessionId})`;
  } catch (error) {
    console.error('analytics track failed', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
