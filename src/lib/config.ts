import type { KeyDefinition, KeyConfig, Letter } from './types';
import { createBareKeyConfig } from './keySetup';

// Re-export types and bare setup for consumers that import from config
export type { Letter, KeyDefinition, KeyConfig } from './types';
export { LETTERS } from './keySetup';

const BARE_KEYS = createBareKeyConfig();

/** Full key config: bare keys plus labels and sound URLs for enabled keys. */
export const KEY_CONFIG: KeyConfig = {
  ...BARE_KEYS,
  Q: {
    ...BARE_KEYS.Q,
    label: '🎷',
    name: 'Chase',
    soundUrl: '/sounds/yakity-yak.ogg',
  },
  R: {
    ...BARE_KEYS.R,
    label: '🚨',
    name: 'Airhorn',
    soundUrl: '/sounds/airhorn.ogg',
  },
  T: {
    ...BARE_KEYS.T,
    label: '👩‍🎤',
    name: 'Shade',
    soundUrl: '/sounds/shade.ogg',
  },
  Y: {
    ...BARE_KEYS.Y,
    label: '🛎️',
    name: 'Ding',
    soundUrl: '/sounds/ding.ogg',
  },
  U: {
    ...BARE_KEYS.U,
    label: '🙊',
    name: 'Uhoh',
    soundUrl: '/sounds/uhoh.ogg',
  },
  I: {
    ...BARE_KEYS.I,
    label: '🙀',
    name: 'Dun-Dun-Dunnn',
    soundUrl: '/sounds/dun-dun-dunnn.ogg',
  },
  O: {
    ...BARE_KEYS.Z,
    label: '😱',
    name: 'Scary (strings)',
    soundUrl: '/sounds/scary.ogg',
  },
  P: {
    ...BARE_KEYS.X,
    label: '🤡',
    name: 'Clown Horn',
    soundUrl: '/sounds/clown-horn.ogg',
  },
  A: {
    ...BARE_KEYS.A,
    label: '🍎',
    name: 'Macbook',
    soundUrl: '/sounds/mac.ogg',
  },
  S: {
    ...BARE_KEYS.S,
    label: '🌀',
    name: 'Boing',
    soundUrl: '/sounds/boing.ogg',
  },
  D: {
    ...BARE_KEYS.J,
    label: '👏',
    name: 'Applause',
    soundUrl: '/sounds/light-applause.ogg',
    hidden: true,
  },
  F: {
    ...BARE_KEYS.F,
    label: '😕',
    name: 'Wah-Wah-Wahhh',
    soundUrl: '/sounds/wah-wah-wahhh.ogg',
  },
  G: {
    ...BARE_KEYS.K,
    label: '🤭',
    name: 'Small laugh',
    soundUrl: '/sounds/dad-joke.ogg',
  },
  H: {
    ...BARE_KEYS.L,
    label: '😂',
    name: 'Big Laugh',
    soundUrl: '/sounds/big-laugh.ogg',
  },
  J: {
    ...BARE_KEYS.V,
    label: '⏳',
    name: 'Jeopardy',
    soundUrl: '/sounds/jeopardy.ogg',
  },
  K: {
    ...BARE_KEYS.N,
    label: '🔥',
    name: 'Dolly Parton',
    soundUrl: '/sounds/burnin.ogg',
  },
  L: {
    ...BARE_KEYS.M,
    label: '💾',
    name: 'Restaging music',
    soundUrl: '/sounds/copy.ogg',
  },

  C: {
    ...BARE_KEYS.C,
    label: '👨‍❤️‍👨',
    name: 'Chant',
    soundUrl: '/sounds/chant.ogg',
  },
  V: {
    ...BARE_KEYS.V,
    label: '🎬🏃🏻',
    name: 'Theme',
    soundUrl: '/sounds/dating-show-theme--no-intro.ogg',
  },
  B: {
    ...BARE_KEYS.V,
    label: '🎬',
    name: 'Intro Theme',
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
  `I love to play Double Dutch
with my crew. Tell me this:
can you think on your feet?`,
  `I'm writing my first novel.
What should the title of my book be?`,
  `Do you think you can dance?`,
  `I would love to take my
collective on a road trip.
If you could go anywhere in the
world, where would we go?`,
  `We’re at the club,
and the disco ball just dropped.
What dance move are you pulling?`,
  `It’s a weeknight and all I want
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
  `If you were a garden,
would your friends call you
a vegetable patch
or field of wildflowers?`,
  `Help! I'm in the bathroom
and I've just run out
of toilet paper.

Who's coming to my rescue?`,
  `I have so much trouble
getting up in the morning.
How many times do you
hit snooze?`,
  `I'm in so many groups threads.
What’s your collective’s
group chat called?`,
  `I wanna start a band
with my collective.

What instrument would
everyone play?`,
  `I'm a leprechaun
at the end of my wits.

How can you help me get to
the end of my rainbow?`,
  `Family is really important to me.

Has your group met
each other’s parents?`,
  `I’m a bit of a style icon.
What are your thoughts
on team uniforms?`,
  `I’ve been hurt before.
How do I know you’re
going to treat me right? `,
  `I usually need a
caffeine break during
a long meeting.

Are you more of
a tea party or
an espresso martini?`,
  `I like to strike
while the iron’s hot.

Is your group more of
a tortoise or a hare?`,
  `I’ve been known to
stretch the truth.

Is honesty a core value
for you, or can I exaggerate
to make a better story?`,
  `I’m constantly stretched thin.
Would your group be
flexible for me,
or will you be
my stable foundation?`,
  `I don’t know what I
want to be when I grow up!

Does your group
have assigned roles?`,
  `We all need a
helping hand sometimes.

Who in your group is
always ready to help?`,
  `Tense situations call for
a pressure release.

Who’s your comic relief?`,
  `Fuck, marry, kill:
ADHD, OCD, and depression`,
  `My backpack is so heavy!
Who's gonna help me
carry my books?`,
  `If we were doing a
team field trip,
where would we go?`,
  `Shopping spree!
Do you want to go
shopping with me? `,
  `I’m an independent woman
who don’t need no man.
Is there room for
individual agency
in your group?`,
  `I’m a bit of a
clairvoyant myself.

Where do you see
yourself in 5 years?`,
  `I’ve heard it ain’t easy being green.
  
Who gonna water the
plants while I'm gone?`,
  `Picture this:

We just had team lunch.
Who’s doing the dishes?`,
  `I always have an idea
at the tip of my tongue.

What can we do to
help me get the idea out?`,
  `I hear everyone is
machine learning.

What are you machine teaching?`,
  `I keep hearing about this “AI”…?
Are you a “I” or a “we”?`,
];
