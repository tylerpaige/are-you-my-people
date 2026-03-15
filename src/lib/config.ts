/**
 * Key definitions: keyCode (for KeyboardEvent.code), letter, label.
 * If soundUrl is present, the key is enabled; otherwise it is disabled.
 */
export type Letter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | "Space";
export interface KeyDefinition {
  keyCode: string;
  letter: Letter;
  label?: string;
  soundUrl?: string;
}
export type KeyConfig = Record<Letter, KeyDefinition>;

export const LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "Space",
] satisfies Letter[];

// The basic key config is a map of letters to their key code and label.
// It does not have any sound URLs, meaning all keys are disabled by default.
const BARE_KEYS: KeyConfig = Object.fromEntries(
  LETTERS.map((letter) => [
    letter,
    { keyCode: letter === "Space" ? "Space" : `Key${letter}`, letter },
  ]),
) as KeyConfig;

// The full key config is the basic key config with keys overridden to
// provide content.
export const KEY_CONFIG: KeyConfig = {
  ...BARE_KEYS,
  C: {
    ...BARE_KEYS.C,
    label: "🤡",
    soundUrl: "/sounds/circus.wav",
  },
  Q: {
    ...BARE_KEYS.Q,
    label: "🎷",
    soundUrl: "/sounds/yakity-yak.wav",
  },
  A: {
    ...BARE_KEYS.A,
    label: "😬",
    soundUrl: "/sounds/awkward.wav",
  },
  L: {
    ...BARE_KEYS.L,
    label: "😂",
    soundUrl: "/sounds/big-laugh.wav",
  }
};

export const KEY_CODE_TO_DEFINITION = new Map<string, KeyDefinition>(
  Object.entries(KEY_CONFIG).map(([_letter, definition]) => [
    definition.keyCode,
    definition,
  ]),
);

export const QWERTY_ROWS: Letter[][] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
  ["Space"],
];

export const getKeyDefinition = (letter: Letter): KeyDefinition => {
  const definition = KEY_CONFIG[letter];
  if (!definition) {
    throw new Error(`Key definition not found for letter: ${letter}`);
  }
  return definition;
};
