// Base URL for all API calls.
// In dev, this is empty (relative paths hit the local Express server).
// In production (Vercel), this points to the Railway backend.
export const API_BASE = import.meta.env.VITE_API_URL ?? "";
