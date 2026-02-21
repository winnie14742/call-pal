import { NextRequest, NextResponse } from 'next/server';
import profile from '@/data/user-profile.json';

export async function GET() {
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  // In production this would persist to a database.
  // For now, return the merged profile so Lovable can update local state.
  const updated = { ...profile, ...body };

  return NextResponse.json(updated);
}
