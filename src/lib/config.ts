import type { KeyDefinition, KeyConfig, Letter } from './types';
import { createBareKeyConfig } from './keySetup';

// Re-export types and bare setup for consumers that import from config
export type { Letter, KeyDefinition, KeyConfig } from './types';
export { LETTERS } from './keySetup';

const BARE_KEYS = createBareKeyConfig();

/** Full key config: bare keys plus labels and sound URLs for enabled keys. */
export const KEY_CONFIG: KeyConfig = {
  ...BARE_KEYS,
  Q: { ...BARE_KEYS.Q, label: '🎷', soundUrl: '/sounds/yakity-yak.ogg' },
  W: { ...BARE_KEYS.W, label: '🧙‍♀️', soundUrl: '/sounds/witch.ogg' },
  E: { ...BARE_KEYS.E, label: '🚨', soundUrl: '/sounds/buzzer.ogg' },
  R: { ...BARE_KEYS.R, label: '⚠️', soundUrl: '/sounds/warning-alarm.ogg' },
  T: { ...BARE_KEYS.T, label: '👩‍🎤', soundUrl: '/sounds/shade.ogg' },
  Y: { ...BARE_KEYS.Y, label: '🛎️', soundUrl: '/sounds/ding.ogg' },
  U: { ...BARE_KEYS.U, label: '🙊', soundUrl: '/sounds/uhoh.ogg' },
  I: { ...BARE_KEYS.I, label: '🙀', soundUrl: '/sounds/dun-dun-dunnn.ogg' },
  O: { ...BARE_KEYS.O, label: '🤔', soundUrl: '/sounds/ooh.ogg' },
  P: { ...BARE_KEYS.P, label: '😼', soundUrl: '/sounds/ooh-2.ogg' },

  A: { ...BARE_KEYS.A, label: '😬', soundUrl: '/sounds/awkward.ogg' },
  S: { ...BARE_KEYS.S, label: '🌀', soundUrl: '/sounds/boing.ogg' },
  D: { ...BARE_KEYS.D, label: '👎🏻', soundUrl: '/sounds/boo.ogg' },
  F: { ...BARE_KEYS.F, label: '😕', soundUrl: '/sounds/wah-wah-wahhh.ogg' },
  G: { ...BARE_KEYS.G, label: '🙄', soundUrl: '/sounds/groan.ogg' },
  H: { ...BARE_KEYS.H, label: '🫢', soundUrl: '/sounds/oh-my-goodness.ogg' },
  J: { ...BARE_KEYS.J, label: '👏', soundUrl: '/sounds/light-applause.ogg' },
  K: { ...BARE_KEYS.K, label: '🤭', soundUrl: '/sounds/dad-joke.ogg' },
  L: { ...BARE_KEYS.L, label: '😂', soundUrl: '/sounds/big-laugh.ogg' },

  Z: { ...BARE_KEYS.Z, label: '😱', soundUrl: '/sounds/scary.ogg' },
  X: { ...BARE_KEYS.X, label: '🤡', soundUrl: '/sounds/clown-horn.ogg' },
  C: { ...BARE_KEYS.C, label: '🎪', soundUrl: '/sounds/circus.ogg' },
  V: { ...BARE_KEYS.V, label: '⏳', soundUrl: '/sounds/jeopardy.ogg' },
  B: {
    ...BARE_KEYS.B,
    label: '🌎',
    soundUrl: '/sounds/the-whole-world-is-watching.ogg',
  },
  N: { ...BARE_KEYS.N, label: '🔥', soundUrl: '/sounds/burnin.ogg' },
  M: { ...BARE_KEYS.M, label: '💾', soundUrl: '/sounds/copy.ogg' },
  Space: {
    ...BARE_KEYS.Space,
    label: '💋',
    soundUrl: '/sounds/dating-game-2.ogg',
  },
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
