import { NextRequest, NextResponse } from 'next/server';
import { makeOutboundCall } from '@/lib/vapi';
import profile from '@/data/user-profile.json';
import type { AppMode, Intent } from '@/lib/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const intent: Intent = body.intent;
  const mode: AppMode = body.mode ?? profile.mode ?? 'calm';

  if (!intent) {
    return NextResponse.json({ error: 'intent is required' }, { status: 400 });
  }

  try {
    const result = await makeOutboundCall(
      { ...intent, mode },
      profile as any
    );
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Failed to make call' },
      { status: 500 }
    );
  }
}
