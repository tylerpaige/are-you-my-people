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

export const QUESTIONS: string[] = [
  `I hate math!

If your collective were a pie,
how do you distribute each slice?`,
  `If you could stay up all night,
what would you hope to accomplish?`,
  `If you were a striped shirt
would it be horizontal stripes
or vertical?`,
  `Sitting or Standing?`,
  `If we were sharing a hot pot,
what would you make sure
we never run out of?`,
  `If you could travel the world,
where would you go?`,
  `I would love to make
s’mores around the campfire
with your collective.

What stories are we all sharing?`,
  `We're all playing a round of Poker.
Who’s most likely to call your bluff?`,
  `If it was a stormy day
what color would you need
to complete your rainbow?`,
  `I love to play
double Dutch with my crew.

Tell me this:
can you think on your feet?`,
  `I'm writing my first novel.
What should the title of my book be?`,
  `Do you think you can dance?`,
  `I would love to take my
collective on a road trip.
If you could go anywhere in the
world, where would we go?`,
  `I'm at the club,
and the disco ball just dropped.
What dance move are you pulling?`,
  `It's a weeknight and all I want
to do is kick back with my crew.
What's something chill we could
all do together?`,
  `I never know what to order
at a restaurant. Wanna go splitsies?
What’s the perfect combination?`,
  `We just had our
first victory dinner!

But now it’s time to
pay the bill.

What happens next?`,
  `I’m the type to
dance the night away.

Are you morning person,
or a night owl? `,
  `I've been told that
a picture is worth
a thousand words.

Tell me one word
to describe your art.`,
  `I love to get a meal
with friends and
eat family style.

What should we order?
And do you have any
dietary restrictions?`,
  `If you were a garden, would your friends call you more of a vegetable patch or a labyrinth of hedges?`,
  `Help! I'm in the bathroom and I've just run out of toilet paper. Who's coming to my rescue?`,
  `I have so much trouble getting up in the morning. How many times do you hit snooze?`,
  `I'm in so many groups threads. What’s your collective’s group chat called?`,
  `I wanna start a band with my collective. what instrument would everyone play?`,
  `I'm a leprechaun at the end of my wits. How can you help me get to the end of my rainbow?`,
  `Family is really important to me. Has your group met each other’s parents?`,
  `I’m a bit of a style icon. What are your thoughts on team uniforms?`,
  `Collective number 2, I’ve been hurt before. How do I know you’re going to treat me right? `,
  `I usually need a caffeine break during a long meeting. Are you more of a tea party or an espresso martini?`,
  `I just have one question: do you feel lucky, punk?`,
  `I like to strike while the iron’s hot. Is your group more of a tortoise or a hare?`,
  `I’ve been known to stretch the truth. Is honesty a core value for you, or can I exaggerate to make a better story?`,
  `I’m constantly stretched thin. Would your group be flexible for me, or will you be my stable foundation?`,
  `I don’t know what I want to be when I grow up! Does your group have assigned roles?`,
  `We all need a helping hand sometimes. Who in your group is always ready with an assist?`,
  `Tense situations call for a pressure release. Who’s your comic relief?`,
  `Fuck, marry, kill: ADHD, OCD, and depression`,
  `My backpack is so heavy! who's gonna help me carry my books?`,
  `If we were doing a team field trip, where would we go?`,
  `Shopping spree! Do you want to go shopping with me? `,
  `I’m an independent woman who don’t need no man. Is there room for individual agency in your group?`,
  `I’m a bit of a clairvoyant myself. Where do you see yourself in 5 years?`,
  `I’ve heard it ain’t easy being green. Who gonna water the plants while I'm gone. `,
  `Picture this: we just had team lunch. Who’s doing the dishes?`,
  `I always have an idea at the tip of my tongue. What can we do to help me get the idea out?`,
  `I hear everyone is machine learning, what're you machine teaching?`,
  `I keep hearing about this “AI”…? Are you a “I” or a “we”?`,
];
