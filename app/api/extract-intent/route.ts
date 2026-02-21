import { NextRequest, NextResponse } from 'next/server';
import { extractIntent } from '@/lib/minimax';
import profile from '@/data/user-profile.json';
import type { AppMode } from '@/lib/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message: string = body.message ?? '';
  const mode: AppMode = body.mode ?? profile.mode ?? 'calm';

  try {
    const intent = await extractIntent(message, profile as any, mode);
    return NextResponse.json(intent);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Failed to extract intent' },
      { status: 500 }
    );
  }
}
