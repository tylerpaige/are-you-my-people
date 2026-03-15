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
