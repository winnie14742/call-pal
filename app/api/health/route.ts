import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    vapi: 'connected',
    minimax: 'connected',
    speechmatics: 'connected',
  });
}
