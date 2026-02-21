import { NextRequest, NextResponse } from 'next/server';
import scenarios from '@/data/demo-scenarios.json';
import type { AppMode } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = (searchParams.get('mode') ?? 'calm') as AppMode;
  const door = searchParams.get('door');

  let result = scenarios;

  if (door) {
    result = result.filter((s) => s.door === door);
  }

  // Return only the relevant mode variant to keep the response clean
  const shaped = result.map(({ calm, power, ...rest }) => ({
    ...rest,
    script: mode === 'calm' ? calm : power,
  }));

  return NextResponse.json(shaped);
}
