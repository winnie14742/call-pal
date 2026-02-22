import type { TranscriptLine } from './types';

const SPEECHMATICS_API_KEY = process.env.SPEECHMATICS_API_KEY ?? '';
const VAPI_API_KEY = process.env.VAPI_API_KEY ?? '';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

const SM_BASE = 'https://asr.api.speechmatics.com/v2';

// ─── Step 1: Get call recording URL from Vapi ────────────────────────────────

async function getCallRecordingUrl(callId: string): Promise<string> {
  const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
    headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch call from Vapi: ${response.status}`);
  }

  const call = await response.json();
  const url = call.recordingUrl ?? call.stereoRecordingUrl;

  if (!url) {
    throw new Error(`No recording available yet for call ${callId}. Call may still be in progress.`);
  }

  return url;
}

// ─── Step 2: Submit recording URL to Speechmatics ────────────────────────────

async function submitTranscriptionJob(audioUrl: string): Promise<string> {
  const config = {
    type: 'transcription',
    fetch_data: { url: audioUrl },
    transcription_config: { language: 'en' },
  };

  const formData = new FormData();
  formData.append('config', JSON.stringify(config));

  const response = await fetch(`${SM_BASE}/jobs/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SPEECHMATICS_API_KEY}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Speechmatics job submission failed: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.id as string;
}

// ─── Step 3: Poll until job is done ──────────────────────────────────────────

async function waitForJob(jobId: string, maxWaitMs = 60000): Promise<void> {
  const interval = 3000;
  const maxAttempts = Math.ceil(maxWaitMs / interval);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${SM_BASE}/jobs/${jobId}/`, {
      headers: { Authorization: `Bearer ${SPEECHMATICS_API_KEY}` },
    });

    if (!response.ok) throw new Error(`Speechmatics status check failed: ${response.status}`);

    const data = await response.json();
    const status = data.job?.status;

    if (status === 'done') return;
    if (status === 'rejected' || status === 'deleted') {
      throw new Error(`Speechmatics job ${status}: ${data.job?.errors?.[0]?.message ?? 'unknown error'}`);
    }

    await new Promise((r) => setTimeout(r, interval));
  }

  throw new Error('Speechmatics transcription timed out after 60 seconds');
}

// ─── Step 4: Fetch and format the transcript ──────────────────────────────────

async function fetchTranscript(jobId: string): Promise<TranscriptLine[]> {
  const response = await fetch(`${SM_BASE}/jobs/${jobId}/transcript?format=json-v2`, {
    headers: { Authorization: `Bearer ${SPEECHMATICS_API_KEY}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transcript: ${response.status}`);
  }

  const data = await response.json();
  const results: any[] = data.results ?? [];

  // Group words into speaker turns
  const lines: TranscriptLine[] = [];
  let currentSpeaker = '';
  let currentWords: string[] = [];

  for (const result of results) {
    if (result.type !== 'word') continue;

    const speaker = result.alternatives?.[0]?.speaker ?? 'S1';
    const word = result.alternatives?.[0]?.content ?? '';

    if (speaker !== currentSpeaker) {
      if (currentWords.length > 0) {
        lines.push({
          speaker: currentSpeaker === 'S1' ? 'agent' : 'representative',
          text: currentWords.join(' '),
        });
      }
      currentSpeaker = speaker;
      currentWords = [word];
    } else {
      currentWords.push(word);
    }
  }

  if (currentWords.length > 0) {
    lines.push({
      speaker: currentSpeaker === 'S1' ? 'agent' : 'representative',
      text: currentWords.join(' '),
    });
  }

  return lines;
}

// ─── Main export ─────────────────────────────────────────────────────────────

const DEMO_TRANSCRIPT: TranscriptLine[] = [
  { speaker: 'representative', text: "Thank you for calling, how can I help you?" },
  { speaker: 'agent', text: "Hi, I'm calling on behalf of Alex regarding their appointment." },
  { speaker: 'representative', text: "Of course, let me pull that up." },
  { speaker: 'representative', text: "I have Thursday at 9am available." },
  { speaker: 'agent', text: "Thursday at 9am is perfect, thank you." },
  { speaker: 'representative', text: "All booked. Have a great day!" },
  { speaker: 'agent', text: "Thank you so much. Goodbye." },
];

export async function getTranscript(callId: string): Promise<TranscriptLine[]> {
  if (DEMO_MODE || callId === 'demo-123') {
    return DEMO_TRANSCRIPT;
  }

  if (!SPEECHMATICS_API_KEY || !VAPI_API_KEY) {
    return DEMO_TRANSCRIPT;
  }

  try {
    const recordingUrl = await getCallRecordingUrl(callId);
    const jobId = await submitTranscriptionJob(recordingUrl);
    await waitForJob(jobId);
    return fetchTranscript(jobId);
  } catch (err: any) {
    const msg = err?.message ?? '';
    if (msg.includes('No recording available') || msg.includes('Failed to fetch call') || msg.includes('404')) {
      return [];
    }
    throw err;
  }
}
