import { computed, reactive, ref } from 'vue';
import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { QUESTIONS, getKeyDefinition, type Letter } from '../lib/config';

export interface QuestionChangedEvent {
  type: 'question-changed';
  index: number;
  timestamp: number;
}

export interface SoundPlayEvent {
  type: 'sound-play';
  letter: Letter;
  timestamp: number;
}

export interface SoundStopEvent {
  type: 'sound-stop';
  letter: Letter;
  timestamp: number;
}

export interface ApplauseEvent {
  type: 'applause';
  timestamp: number;
}

/** Which person (1–5) was marked as having been asked a question. */
export type QuestionAskSlot = 1 | 2 | 3 | 4 | 5;

export interface QuestionAskIncrementEvent {
  type: 'question-ask-increment';
  slot: QuestionAskSlot;
  timestamp: number;
}

export interface QuestionAskResetEvent {
  type: 'question-ask-reset';
  timestamp: number;
}

export interface CommercialBreakEvent {
  type: 'commercial-break';
  isOnBreak: boolean;
  timestamp: number;
}

export type FeedDisplayMode = 'show' | 'commercials' | 'credits';

export interface FeedModeChangedEvent {
  type: 'feed-mode-changed';
  mode: FeedDisplayMode;
  timestamp: number;
}

export type FeedEvent =
  | QuestionChangedEvent
  | SoundPlayEvent
  | SoundStopEvent
  | ApplauseEvent
  | QuestionAskIncrementEvent
  | QuestionAskResetEvent
  | CommercialBreakEvent
  | FeedModeChangedEvent;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;
const FEED_CHANNEL =
  (import.meta.env.VITE_FEED_CHANNEL as string | undefined) ||
  'are-you-my-people';

let supabaseClient: SupabaseClient | null = null;
let realtimeChannel: RealtimeChannel | null = null;
let isSubscribed = false;

function ensureSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 5,
        },
      },
    });
  }
  return supabaseClient;
}

function ensureChannel(): RealtimeChannel | null {
  const client = ensureSupabaseClient();
  if (!client) return null;
  if (!realtimeChannel) {
    realtimeChannel = client.channel(FEED_CHANNEL, {
      config: {
        broadcast: {
          self: false,
        },
      },
    });
  }
  return realtimeChannel;
}

// ---- Shared local feed state ----

const currentQuestionIndex = ref<number | null>(null);

const lastApplauseAt = ref<number | null>(null);
const feedDisplayMode = ref<FeedDisplayMode>('show');

const questionAskCounts = reactive<[number, number, number, number, number]>([
  0, 0, 0, 0, 0,
]);

// Track active letters in a reactive record for good reactivity.
const activeLettersRecord = reactive<Record<Letter, boolean>>(
  {} as Record<Letter, boolean>
);

function applyQuestionChangedLocally(index: number) {
  if (Number.isInteger(index) && index >= 0) {
    currentQuestionIndex.value = index % QUESTIONS.length;
  }
}

function applySoundPlayLocally(letter: Letter) {
  activeLettersRecord[letter] = true;
}

function applySoundStopLocally(letter: Letter) {
  activeLettersRecord[letter] = false;
}

function applyApplauseLocally() {
  lastApplauseAt.value = Date.now();
}

function isQuestionAskSlot(n: number): n is QuestionAskSlot {
  return n >= 1 && n <= 5 && Number.isInteger(n);
}

function applyQuestionAskIncrementLocally(slot: QuestionAskSlot) {
  const i = (slot - 1) as 0 | 1 | 2 | 3 | 4;
  questionAskCounts[i] += 1;
}

function applyQuestionAskResetLocally() {
  for (let i = 0; i < 5; i++) {
    const idx = i as 0 | 1 | 2 | 3 | 4;
    questionAskCounts[idx] = 0;
  }
}

function isFeedDisplayMode(mode: string): mode is FeedDisplayMode {
  return mode === 'show' || mode === 'commercials' || mode === 'credits';
}

function applyFeedModeLocally(mode: FeedDisplayMode) {
  feedDisplayMode.value = mode;
}

function subscribeIfNeeded() {
  if (isSubscribed) return;
  const channel = ensureChannel();
  if (!channel) return;

  channel
    .on('broadcast', { event: 'question-changed' }, (payload) => {
      const data = payload.payload as QuestionChangedEvent | undefined;
      if (!data || typeof data.index !== 'number') return;
      applyQuestionChangedLocally(data.index);
    })
    .on('broadcast', { event: 'sound-play' }, (payload) => {
      const data = payload.payload as SoundPlayEvent | undefined;
      if (!data || !data.letter) return;
      applySoundPlayLocally(data.letter);
    })
    .on('broadcast', { event: 'sound-stop' }, (payload) => {
      const data = payload.payload as SoundStopEvent | undefined;
      if (!data || !data.letter) return;
      applySoundStopLocally(data.letter);
    })
    .on('broadcast', { event: 'applause' }, (payload) => {
      const data = payload.payload as ApplauseEvent | undefined;
      if (!data || data.type !== 'applause') return;
      applyApplauseLocally();
    })
    .on('broadcast', { event: 'question-ask-increment' }, (payload) => {
      const data = payload.payload as QuestionAskIncrementEvent | undefined;
      if (!data || data.type !== 'question-ask-increment') return;
      const slot = data.slot;
      if (!isQuestionAskSlot(slot)) return;
      applyQuestionAskIncrementLocally(slot);
    })
    .on('broadcast', { event: 'question-ask-reset' }, (payload) => {
      const data = payload.payload as QuestionAskResetEvent | undefined;
      if (!data || data.type !== 'question-ask-reset') return;
      applyQuestionAskResetLocally();
    })
    .on('broadcast', { event: 'commercial-break' }, (payload) => {
      const data = payload.payload as CommercialBreakEvent | undefined;
      if (!data || data.type !== 'commercial-break') return;
      applyFeedModeLocally(data.isOnBreak ? 'commercials' : 'show');
    })
    .on('broadcast', { event: 'feed-mode-changed' }, (payload) => {
      const data = payload.payload as FeedModeChangedEvent | undefined;
      if (!data || data.type !== 'feed-mode-changed') return;
      if (!isFeedDisplayMode(data.mode)) return;
      applyFeedModeLocally(data.mode);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        isSubscribed = true;
      }
    });
}

// ---- Public producer API ----

export function useFeedProducer() {
  const channel = ensureChannel();

  function publishQuestionChanged(index: number) {
    // Always update local state for this tab.
    applyQuestionChangedLocally(index);

    if (!channel) return;
    const event: QuestionChangedEvent = {
      type: 'question-changed',
      index,
      timestamp: Date.now(),
    };
    void channel.send({
      type: 'broadcast',
      event: 'question-changed',
      payload: event,
    });
  }

  function publishSoundPlay(letter: Letter) {
    applySoundPlayLocally(letter);

    if (!channel) return;
    const event: SoundPlayEvent = {
      type: 'sound-play',
      letter,
      timestamp: Date.now(),
    };
    void channel.send({
      type: 'broadcast',
      event: 'sound-play',
      payload: event,
    });
  }

  function publishSoundStop(letter: Letter) {
    applySoundStopLocally(letter);

    if (!channel) return;
    const event: SoundStopEvent = {
      type: 'sound-stop',
      letter,
      timestamp: Date.now(),
    };
    void channel.send({
      type: 'broadcast',
      event: 'sound-stop',
      payload: event,
    });
  }

  function publishApplause() {
    if (!channel) return;
    const event: ApplauseEvent = {
      type: 'applause',
      timestamp: Date.now(),
    };
    void channel.send({
      type: 'broadcast',
      event: 'applause',
      payload: event,
    });
  }

  function publishQuestionAskIncrement(slot: QuestionAskSlot) {
    applyQuestionAskIncrementLocally(slot);

    if (!channel) return;
    const event: QuestionAskIncrementEvent = {
      type: 'question-ask-increment',
      slot,
      timestamp: Date.now(),
    };
    void channel.send({
      type: 'broadcast',
      event: 'question-ask-increment',
      payload: event,
    });
  }

  function publishQuestionAskReset() {
    applyQuestionAskResetLocally();

    if (!channel) return;
    const event: QuestionAskResetEvent = {
      type: 'question-ask-reset',
      timestamp: Date.now(),
    };
    void channel.send({
      type: 'broadcast',
      event: 'question-ask-reset',
      payload: event,
    });
  }

  function publishCommercialBreakStart() {
    publishFeedMode('commercials');
  }

  function publishCommercialBreakEnd() {
    publishFeedMode('show');
  }

  function publishFeedMode(mode: FeedDisplayMode) {
    applyFeedModeLocally(mode);

    if (!channel) return;
    const event: FeedModeChangedEvent = {
      type: 'feed-mode-changed',
      mode,
      timestamp: Date.now(),
    };
    void channel.send({
      type: 'broadcast',
      event: 'feed-mode-changed',
      payload: event,
    });
  }

  return {
    publishQuestionChanged,
    publishSoundPlay,
    publishSoundStop,
    publishApplause,
    publishQuestionAskIncrement,
    publishQuestionAskReset,
    publishCommercialBreakStart,
    publishCommercialBreakEnd,
    publishFeedMode,
  };
}

// ---- Public consumer API ----

export function useFeedConsumer() {
  // Ensure we have at least initialized local flags so all letters exist.
  (Object.keys(getKeyDefinition as unknown as object) as Letter[]).forEach(
    (letter) => {
      if (!(letter in activeLettersRecord)) {
        activeLettersRecord[letter] = false;
      }
    }
  );

  subscribeIfNeeded();

  const currentQuestion = computed<string | null>(() => {
    if (
      currentQuestionIndex.value == null ||
      !Number.isInteger(currentQuestionIndex.value)
    ) {
      return null;
    }
    const idx =
      ((currentQuestionIndex.value % QUESTIONS.length) + QUESTIONS.length) %
      QUESTIONS.length;
    return QUESTIONS[idx] ?? null;
  });

  const activeLettersList = computed<Letter[]>(() =>
    (Object.keys(activeLettersRecord) as Letter[]).filter(
      (letter) => activeLettersRecord[letter]
    )
  );

  const activeLetterDefinitions = computed(() =>
    activeLettersList.value.map((letter) => getKeyDefinition(letter))
  );

  return {
    currentQuestionIndex,
    currentQuestion,
    activeLettersList,
    activeLetterDefinitions,
    lastApplauseAt,
    questionAskCounts,
    feedDisplayMode,
  };
}
