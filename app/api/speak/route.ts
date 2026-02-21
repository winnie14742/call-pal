import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/minimax';
import type { AppMode } from '@/lib/types';

const calmTexts: Record<string, string> = {
  default: "Of course. Take your time — I'm here and ready whenever you are.",
  confirm: "Got it. Just to make sure I understand — you'd like me to make this call for you. Is that right?",
  success: "All done. Everything went smoothly. You don't need to do anything else.",
  waiting: "Still on the call — everything is going well. I'll let you know as soon as it's finished.",
};

const powerTexts: Record<string, string> = {
  default: 'On it.',
  confirm: 'Making the call now.',
  success: 'Done.',
  waiting: 'Still on hold.',
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const mode: AppMode = body.mode ?? 'calm';
  const trigger: string = body.trigger ?? 'default';
  const customText: string | undefined = body.text;

  const texts = mode === 'calm' ? calmTexts : powerTexts;
  const text = customText ?? texts[trigger] ?? texts.default;

  try {
    const result = await generateSpeech(text, mode);
    return NextResponse.json({
      ...result,
      mode,
      pacing: mode === 'calm' ? 'slow' : 'normal',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
