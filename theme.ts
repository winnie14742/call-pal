// Maps a user's favourite thing to a full UI theme.
// Lovable reads this and applies it — colors, emoji, language, icons.

export interface Theme {
  id: string;
  label: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentEmoji: string;
  buttonStyle: 'rounded' | 'pill' | 'sharp';
  fontStyle: 'playful' | 'elegant' | 'friendly' | 'bold';
  greeting: string;
  callButtonText: string;
  waitingMessage: string;
  successMessage: string;
}

const THEME_MAP: Record<string, Theme> = {
  barbie: {
    id: 'barbie',
    label: 'Barbie',
    primaryColor: '#FF69B4',
    secondaryColor: '#FF1493',
    backgroundColor: '#FFF0F5',
    textColor: '#8B0057',
    accentEmoji: '💗',
    buttonStyle: 'pill',
    fontStyle: 'playful',
    greeting: "Hi! I'm CallPal, and I'm here to help 💗",
    callButtonText: "Let's do this! 💗",
    waitingMessage: 'CallPal is on the phone for you, bestie 💗',
    successMessage: 'All done! You did amazing 💗',
  },
  space: {
    id: 'space',
    label: 'Space',
    primaryColor: '#6C63FF',
    secondaryColor: '#3B28CC',
    backgroundColor: '#0D0D1A',
    textColor: '#E0E0FF',
    accentEmoji: '🚀',
    buttonStyle: 'sharp',
    fontStyle: 'bold',
    greeting: "Mission Control here. CallPal is ready 🚀",
    callButtonText: 'Launch Call 🚀',
    waitingMessage: 'CallPal is in orbit, handling the call 🚀',
    successMessage: 'Mission complete 🚀',
  },
  nature: {
    id: 'nature',
    label: 'Nature',
    primaryColor: '#2D6A4F',
    secondaryColor: '#40916C',
    backgroundColor: '#F8FFF8',
    textColor: '#1B4332',
    accentEmoji: '🌿',
    buttonStyle: 'rounded',
    fontStyle: 'friendly',
    greeting: "Hello! CallPal is here, calm as ever 🌿",
    callButtonText: 'Let CallPal handle it 🌿',
    waitingMessage: "Taking it one step at a time 🌿",
    successMessage: "All done, nice and easy 🌿",
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    primaryColor: '#0096C7',
    secondaryColor: '#0077B6',
    backgroundColor: '#F0F8FF',
    textColor: '#023E8A',
    accentEmoji: '🌊',
    buttonStyle: 'pill',
    fontStyle: 'friendly',
    greeting: "Hi! CallPal is ready to dive in 🌊",
    callButtonText: 'Make the call 🌊',
    waitingMessage: "Flowing through the call for you 🌊",
    successMessage: "Smooth sailing — all done 🌊",
  },
  minecraft: {
    id: 'minecraft',
    label: 'Minecraft',
    primaryColor: '#5D8233',
    secondaryColor: '#3C5A1E',
    backgroundColor: '#F5F0E8',
    textColor: '#2C2C2C',
    accentEmoji: '⛏️',
    buttonStyle: 'sharp',
    fontStyle: 'bold',
    greeting: "CallPal has spawned and is ready ⛏️",
    callButtonText: 'Mine that call ⛏️',
    waitingMessage: "Building your outcome, block by block ⛏️",
    successMessage: "Achievement unlocked ⛏️",
  },
  cats: {
    id: 'cats',
    label: 'Cats',
    primaryColor: '#C084FC',
    secondaryColor: '#A855F7',
    backgroundColor: '#FAF5FF',
    textColor: '#581C87',
    accentEmoji: '🐱',
    buttonStyle: 'rounded',
    fontStyle: 'playful',
    greeting: "Meow! CallPal is here and ready 🐱",
    callButtonText: 'Pounce on that call 🐱',
    waitingMessage: "Quietly handling the call for you 🐱",
    successMessage: "Purrfect — all done 🐱",
  },
  default: {
    id: 'default',
    label: 'Calm',
    primaryColor: '#7C3AED',
    secondaryColor: '#6D28D9',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    accentEmoji: '🌿',
    buttonStyle: 'rounded',
    fontStyle: 'friendly',
    greeting: "Hi! I'm CallPal, here to help 🌿",
    callButtonText: 'Let CallPal handle it',
    waitingMessage: "CallPal is on the call for you",
    successMessage: "All done. You don't need to do anything else.",
  },
};

export function getTheme(favouriteThing: string | null | undefined): Theme {
  if (!favouriteThing) return THEME_MAP.default;

  const key = favouriteThing.toLowerCase().trim();

  // Direct match
  if (THEME_MAP[key]) return THEME_MAP[key];

  // Fuzzy keyword match
  if (key.includes('barbie') || key.includes('pink') || key.includes('doll')) return THEME_MAP.barbie;
  if (key.includes('space') || key.includes('star') || key.includes('rocket') || key.includes('planet')) return THEME_MAP.space;
  if (key.includes('nature') || key.includes('tree') || key.includes('forest') || key.includes('plant')) return THEME_MAP.nature;
  if (key.includes('ocean') || key.includes('sea') || key.includes('water') || key.includes('beach') || key.includes('fish')) return THEME_MAP.ocean;
  if (key.includes('minecraft') || key.includes('roblox') || key.includes('game') || key.includes('gaming')) return THEME_MAP.minecraft;
  if (key.includes('cat') || key.includes('kitten') || key.includes('kitty')) return THEME_MAP.cats;

  // No match — return default with their word as emoji flavor
  return {
    ...THEME_MAP.default,
    id: key,
    label: favouriteThing,
  };
}

export { THEME_MAP };
