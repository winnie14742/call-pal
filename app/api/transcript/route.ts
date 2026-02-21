import { NextRequest, NextResponse } from 'next/server';
import { getTranscript } from '@/lib/speechmatics';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const callId: string = body.callId;

  if (!callId) {
    return NextResponse.json({ error: 'callId is required' }, { status: 400 });
  }

  try {
    const lines = await getTranscript(callId);
    return NextResponse.json({ lines });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Failed to get transcript' },
      { status: 500 }
    );
  }
}
