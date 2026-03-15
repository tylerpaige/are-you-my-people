import type { KeyConfig, Letter } from "./types";

/** All letters the app supports (A–Z + Space). */
export const LETTERS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "Space",
] as const satisfies readonly Letter[];

/**
 * Builds the minimal key config: one entry per letter with keyCode and letter only.
 * No labels or sound URLs — the bare minimum needed for the app to run.
 */
export function createBareKeyConfig(): KeyConfig {
  return Object.fromEntries(
    LETTERS.map((letter) => [
      letter,
      { keyCode: letter === "Space" ? "Space" : `Key${letter}`, letter },
    ]),
  ) as KeyConfig;
}
