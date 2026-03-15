import type { KeyDefinition, KeyConfig, Letter } from "./types";
import { createBareKeyConfig } from "./keySetup";

// Re-export types and bare setup for consumers that import from config
export type { Letter, KeyDefinition, KeyConfig } from "./types";
export { LETTERS } from "./keySetup";

const BARE_KEYS = createBareKeyConfig();

/** Full key config: bare keys plus labels and sound URLs for enabled keys. */
export const KEY_CONFIG: KeyConfig = {
  ...BARE_KEYS,
  C: { ...BARE_KEYS.C, label: "🤡", soundUrl: "/sounds/circus.wav" },
  Q: { ...BARE_KEYS.Q, label: "🎷", soundUrl: "/sounds/yakity-yak.wav" },
  A: { ...BARE_KEYS.A, label: "😬", soundUrl: "/sounds/awkward.wav" },
  L: { ...BARE_KEYS.L, label: "😂", soundUrl: "/sounds/big-laugh.wav" },
  W: { ...BARE_KEYS.W, label: "🧙‍♀️", soundUrl: "/sounds/witch.wav" },
  E: { ...BARE_KEYS.E, label: "🚨", soundUrl: "/sounds/buzzer.wav" },
  R: { ...BARE_KEYS.R, label: "⚠️", soundUrl: "/sounds/warning-alarm.wav" },
  T: { ...BARE_KEYS.T, label: "👩‍🎤", soundUrl: "/sounds/shade.wav" },
};

export const KEY_CODE_TO_DEFINITION = new Map<string, KeyDefinition>(
  Object.values(KEY_CONFIG).map((def) => [def.keyCode, def]),
);

export const QWERTY_ROWS: Letter[][] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
  ["Space"],
];

export function getKeyDefinition(letter: Letter): KeyDefinition {
  const definition = KEY_CONFIG[letter];
  if (!definition) throw new Error(`Key definition not found for letter: ${letter}`);
  return definition;
}
