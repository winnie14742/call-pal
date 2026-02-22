import type { AppMode } from './types';

const STORAGE_KEY = 'callpal_app_mode';

export function setAppMode(mode: AppMode): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }
}

export function getAppMode(): AppMode | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === 'calm' || value === 'power') return value;
  return null;
}
