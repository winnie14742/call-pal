import { BASE_URL } from "./config";

export async function extractIntent(message: string, mode: string) {
  const res = await fetch(`${BASE_URL}/api/extract-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mode }),
  });
  return res.json();
}

export async function makeCall(intent: object, mode: string) {
  const res = await fetch(`${BASE_URL}/api/make-call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent, mode }),
  });
  return res.json();
}

export async function getTranscript(callId: string) {
  const res = await fetch(`${BASE_URL}/api/transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callId }),
  });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${BASE_URL}/api/profile`);
  return res.json();
}

export async function getTheme(favourite: string) {
  const res = await fetch(
    `${BASE_URL}/api/theme?favourite=${encodeURIComponent(favourite)}`
  );
  return res.json();
}

export async function completeOnboarding(
  name: string,
  favourite_thing: string,
  mode: string
) {
  const res = await fetch(`${BASE_URL}/api/onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, favourite_thing, mode }),
  });
  return res.json();
}

export async function updateProfile(updates: object) {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}
