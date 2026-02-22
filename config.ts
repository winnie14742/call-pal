// Use same origin when empty (local/dev); set NEXT_PUBLIC_API_URL to hit a different backend.
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
