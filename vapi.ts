import type { Intent, UserProfile, CallResult, AppMode } from './types';

const VAPI_API_KEY = process.env.VAPI_API_KEY ?? '';
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID ?? '';
/** If set, all outbound calls go to this number (E.164 or 10-digit). Overrides intent.provider_phone. */
const VAPI_CALL_TO_NUMBER = process.env.VAPI_CALL_TO_NUMBER ?? '';
const DEMO_MODE = process.env.DEMO_MODE === 'true' || !VAPI_API_KEY || !VAPI_PHONE_NUMBER_ID;

/** Normalize to E.164 for US. VAPI requires + and country code. */
function toE164(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (phone?.trim().startsWith('+')) return phone.trim();
  return digits ? `+${digits}` : phone || '';
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function buildSystemPrompt(intent: Intent, userProfile: UserProfile, mode: AppMode): string {
  const timeOfDay = getTimeOfDayGreeting();

  if (mode === 'calm') {
    return `You are CallPal, a warm and caring assistant calling on behalf of ${userProfile.name}.

CONVERSATION FLOW — follow this exactly:
1. Greet them warmly. Say "Good ${timeOfDay}, my name is CallPal and I'm calling on behalf of ${userProfile.name}."
2. State the reason clearly and simply: "${intent.reason}."
3. Ask them an open question — something like "Would you be able to help with that?" or "Do you have any availability?" depending on the situation.
4. Listen to their response. Reply naturally and helpfully — if they offer options, pick the most suitable one based on ${userProfile.name}'s preference for ${userProfile.preferred_time}. If they ask a question, answer it simply.
5. Confirm the outcome in one short sentence — just the key detail (time, date, reference number).
6. Close in a single breath: "Thank you so much, have a wonderful ${timeOfDay}. Goodbye." — then end the call immediately. Do not say anything else after this.

TONE RULES:
- Speak like a kind human — not a robot.
- Each response must be 1-2 sentences MAX. Say one thing, stop, listen.
- NEVER repeat information already stated. Once you've said the reason, never say it again.
- NEVER echo back what they just told you word for word.
- NEVER summarise the call before ending. Just thank them briefly and say goodbye.
- Once something is confirmed, move on immediately. Do not re-confirm it.`;
  }

  return `You are CallPal, an efficient assistant calling on behalf of ${userProfile.name}.

CONVERSATION FLOW — follow this exactly:
1. Greet briefly: "Good ${timeOfDay}, I'm CallPal calling for ${userProfile.name}."
2. State the reason directly: "${intent.reason}."
3. Ask for what's needed: a simple direct question to get the outcome.
4. Reply to their response naturally. Accept the first reasonable option.
5. Confirm the outcome in one short sentence.
6. Close in a single sentence: "Thanks, have a good ${timeOfDay}. Goodbye." — then end immediately. Nothing more.

TONE RULES:
- Direct, efficient, human. No filler words.
- Each response 1 sentence MAX.
- Never repeat anything already said. Never echo back their words.
- Confirm once, then end.`;
}

function buildFirstMessage(intent: Intent, userProfile: UserProfile, mode: AppMode): string {
  const timeOfDay = getTimeOfDayGreeting();

  if (mode === 'calm') {
    return `Good ${timeOfDay}! My name is CallPal, and I'm calling on behalf of ${userProfile.name}. ${userProfile.name} has been dealing with ${intent.reason}, and I was hoping you might be able to help. Do you have a moment?`;
  }

  return `Good ${timeOfDay}, I'm CallPal calling for ${userProfile.name} — reaching out about ${intent.reason}. Can you help with that?`;
}

export async function makeOutboundCall(
  intent: Intent,
  userProfile: UserProfile
): Promise<CallResult> {
  const mode: AppMode = intent.mode ?? 'calm';

  if (DEMO_MODE) {
    return {
      callId: 'demo-123',
      status: 'in_progress',
      message:
        mode === 'calm'
          ? `CallPal is gently speaking with ${intent.provider_name} on your behalf. Sit tight.`
          : `Calling ${intent.provider_name} now.`,
      mode,
    };
  }

  const systemPrompt = buildSystemPrompt(intent, userProfile, mode);
  const firstMessage = buildFirstMessage(intent, userProfile, mode);

  const destinationNumber = toE164(VAPI_CALL_TO_NUMBER || intent.provider_phone || '');

  if (!destinationNumber || destinationNumber === '+') {
    throw new Error('No valid destination phone number. Set provider_phone in intent or VAPI_CALL_TO_NUMBER env.');
  }

  const response = await fetch('https://api.vapi.ai/call', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumberId: VAPI_PHONE_NUMBER_ID,
      customer: {
        number: destinationNumber,
        name: intent.provider_name || 'Customer',
      },
      assistant: {
        firstMessage,
        model: {
          provider: 'openai',
          model: 'gpt-4o',
          messages: [{ role: 'system', content: systemPrompt }],
        },
        voice: {
          provider: 'openai',
          voiceId: mode === 'calm' ? 'nova' : 'alloy',
        },
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Vapi API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const callId = data.id ?? data.callId ?? data.call_id ?? '';

  if (!callId) {
    throw new Error(`Vapi did not return a call id. Response: ${JSON.stringify(data)}`);
  }

  return {
    callId: String(callId),
    status: 'in_progress',
    message:
      mode === 'calm'
        ? `CallPal is speaking with ${intent.provider_name} on your behalf.`
        : `Calling ${intent.provider_name}.`,
    mode,
  };
}
