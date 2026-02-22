import type { Intent, UserProfile, AppMode } from './types';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY ?? '';
const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
// Use demo mode when explicitly set or when no API key (e.g. local dev)
const DEMO_MODE = process.env.DEMO_MODE === 'true' || !MINIMAX_API_KEY;

// ─── Intent Extraction ───────────────────────────────────────────────────────

export async function extractIntent(
  message: string,
  userProfile: UserProfile,
  mode: AppMode = 'calm'
): Promise<Intent> {
  if (DEMO_MODE) {
    return {
      intent: 'book_appointment',
      door: 'doctor',
      provider_name: userProfile.doctor_name,
      provider_phone: userProfile.doctor_phone,
      reason: 'stomach pain',
      time_preference: 'Thursday morning',
      user_name: userProfile.name,
      mode,
    };
  }

  const systemPrompt = `You are CallPal, an assistant that makes phone calls for people who find it difficult.
Extract the user's intent from their message and return ONLY a JSON object with these fields:
- intent: one of "book_appointment", "dispute_charge", "refill_prescription", "insurance_query", "utility_service"
- door: one of "doctor", "bank", "pharmacy", "insurance", "utility"
- provider_name: match to user's saved contacts if mentioned, otherwise use what they say
- provider_phone: match from user profile contacts
- reason: a short description of why they need the call
- time_preference: when they want the appointment (if applicable, else null)
- prescription_number: if mentioned (else null)
- user_name: always "${userProfile.name}"
- mode: "${mode}"

User profile contacts:
- Doctor: ${userProfile.doctor_name} (${userProfile.doctor_phone})
- Bank: ${userProfile.bank_name} (${userProfile.bank_phone})
- Pharmacy: ${userProfile.pharmacy_name} (${userProfile.pharmacy_phone})
- Insurance: ${userProfile.insurance_name} (${userProfile.insurance_phone})
- Utility: ${userProfile.utility_name} (${userProfile.utility_phone})

Return ONLY valid JSON. No explanation, no markdown, just the JSON object.`;

  const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.1,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`MiniMax chat API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? '{}';

  // MiniMax reasoning models wrap output in <think>...</think> — strip it
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  try {
    return JSON.parse(cleaned) as Intent;
  } catch {
    throw new Error(`MiniMax returned invalid JSON: ${cleaned}`);
  }
}

// ─── Text-to-Speech ──────────────────────────────────────────────────────────

export async function generateSpeech(
  text: string,
  mode: AppMode = 'calm'
): Promise<{ audio: string; text: string }> {
  if (DEMO_MODE) {
    return { audio: 'mock_audio_base64', text };
  }

  // Calm mode: warm, slower voice. Power mode: neutral, standard pace.
  const voiceId = mode === 'calm' ? 'Calm_Woman' : 'Friendly_Person';
  const speed = mode === 'calm' ? 0.85 : 1.0;

  const response = await fetch(`${MINIMAX_BASE_URL}/t2a_v2`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'speech-2.6-turbo',
      text,
      voice_setting: {
        voice_id: voiceId,
        speed,
        vol: 1.0,
        pitch: 0,
      },
      audio_setting: {
        format: 'mp3',
        sample_rate: 32000,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`MiniMax TTS API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const audioBase64 = data.data?.audio ?? '';

  return { audio: audioBase64, text };
}
