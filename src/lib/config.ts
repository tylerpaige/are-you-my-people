import type { KeyDefinition, KeyConfig, Letter } from './types';
import { createBareKeyConfig } from './keySetup';

// Re-export types and bare setup for consumers that import from config
export type { Letter, KeyDefinition, KeyConfig } from './types';
export { LETTERS } from './keySetup';

const BARE_KEYS = createBareKeyConfig();

/** Full key config: bare keys plus labels and sound URLs for enabled keys. */
export const KEY_CONFIG: KeyConfig = {
  ...BARE_KEYS,
  Q: { ...BARE_KEYS.Q, label: '🎷', soundUrl: '/sounds/yakity-yak.wav' },
  W: { ...BARE_KEYS.W, label: '🧙‍♀️', soundUrl: '/sounds/witch.wav' },
  E: { ...BARE_KEYS.E, label: '🚨', soundUrl: '/sounds/buzzer.wav' },
  R: { ...BARE_KEYS.R, label: '⚠️', soundUrl: '/sounds/warning-alarm.wav' },
  T: { ...BARE_KEYS.T, label: '👩‍🎤', soundUrl: '/sounds/shade.wav' },
  // Y: { ...BARE_KEYS.Y, label: "", soundUrl: "/sounds/.wav" },
  // W: { ...BARE_KEYS.U, label: "", soundUrl: "/sounds/.wav" },
  // I: { ...BARE_KEYS.I, label: "", soundUrl: "/sounds/.wav" },
  // O: { ...BARE_KEYS.O, label: "", soundUrl: "/sounds/.wav" },
  // P: { ...BARE_KEYS.P, label: "", soundUrl: "/sounds/.wav" },

  A: { ...BARE_KEYS.A, label: '😬', soundUrl: '/sounds/awkward.wav' },
  // S: { ...BARE_KEYS.S, label: "", soundUrl: "/sounds/.wav" },
  // D: { ...BARE_KEYS.D, label: "", soundUrl: "/sounds/.wav" },
  // F: { ...BARE_KEYS.F, label: "", soundUrl: "/sounds/.wav" },
  // G: { ...BARE_KEYS.G, label: "", soundUrl: "/sounds/.wav" },
  // H: { ...BARE_KEYS.H, label: "", soundUrl: "/sounds/.wav" },
  // J: { ...BARE_KEYS.J, label: "", soundUrl: "/sounds/.wav" },
  // K: { ...BARE_KEYS.K, label: "", soundUrl: "/sounds/.wav" },
  L: { ...BARE_KEYS.L, label: '😂', soundUrl: '/sounds/big-laugh.wav' },

  // Z: { ...BARE_KEYS.Z, label: "", soundUrl: "/sounds/.wav" },
  // X: { ...BARE_KEYS.X, label: "", soundUrl: "/sounds/.wav" },
  C: { ...BARE_KEYS.C, label: '🤡', soundUrl: '/sounds/circus.wav' },
  // V: { ...BARE_KEYS.V, label: "", soundUrl: "/sounds/.wav" },
  // B: { ...BARE_KEYS.B, label: "", soundUrl: "/sounds/.wav" },
  // N: { ...BARE_KEYS.N, label: "", soundUrl: "/sounds/.wav" },
  // M: { ...BARE_KEYS.M, label: "", soundUrl: "/sounds/.wav" },
};

export const KEY_CODE_TO_DEFINITION = new Map<string, KeyDefinition>(
  Object.values(KEY_CONFIG).map((def) => [def.keyCode, def])
);

export const QWERTY_ROWS: Letter[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ['Space'],
];

export function getKeyDefinition(letter: Letter): KeyDefinition {
  const definition = KEY_CONFIG[letter];
  if (!definition)
    throw new Error(`Key definition not found for letter: ${letter}`);
  return definition;
}
