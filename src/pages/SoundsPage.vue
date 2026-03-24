<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Keyboard from '../components/Keyboard.vue';
import MobileSoundGrid from '../components/MobileSoundGrid.vue';
import Logo from '../components/Logo.vue';
import { useSoundboard } from '../composables/useSoundboard';
import {
  useFeedConsumer,
  useFeedProducer,
  type QuestionAskSlot,
} from '../composables/useRealtimeFeed';
import { KEY_CODE_TO_DEFINITION, QWERTY_ROWS, type Letter } from '../lib/config';

const {
  loading,
  preload,
  play,
  fadeOut,
  fadeOutAll,
  startEnterHoldFade,
  endEnterHoldFade,
  getActivePlays,
  hasAnyActivePlays,
  totalSounds,
  loadedSoundsCount,
  allSoundsLoaded,
} = useSoundboard();
const shiftHeld = ref(false);

const { questionAskCounts } = useFeedConsumer();
const {
  publishSoundPlay,
  publishSoundStop,
  publishApplause,
  publishQuestionAskIncrement,
  publishQuestionAskReset,
} = useFeedProducer();

const ASK_SLOTS: QuestionAskSlot[] = [1, 2, 3, 4, 5];

function onApplauseClick() {
  play('J');
  publishApplause();
}

// ---- Mobile stopwatch: total (session) vs this question; incrementing a person laps "this question" ----
const stopwatchRunning = ref(false);
const totalMs = ref(0);
const questionMs = ref(0);
let totalStartAt: number | null = null;
let questionSegmentStartAt: number | null = null;
let stopwatchRafId: number | null = null;

function formatStopwatchMs(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

const formattedTotal = computed(() => formatStopwatchMs(totalMs.value));
const formattedQuestion = computed(() => formatStopwatchMs(questionMs.value));

function stopwatchTick() {
  if (!stopwatchRunning.value) return;
  const now = Date.now();
  if (totalStartAt != null) totalMs.value = now - totalStartAt;
  if (questionSegmentStartAt != null) {
    questionMs.value = now - questionSegmentStartAt;
  }
  stopwatchRafId = requestAnimationFrame(stopwatchTick);
}

function startStopwatch() {
  if (stopwatchRunning.value) return;
  const now = Date.now();
  stopwatchRunning.value = true;
  totalStartAt = now;
  questionSegmentStartAt = now;
  totalMs.value = 0;
  questionMs.value = 0;
  stopwatchTick();
}

/** Increment person counter, lap "this question" timer, and start the stopwatch if idle. */
function onQuestionAskClick(slot: QuestionAskSlot) {
  publishQuestionAskIncrement(slot);
  const now = Date.now();
  if (!stopwatchRunning.value) {
    stopwatchRunning.value = true;
    totalStartAt = now;
    questionSegmentStartAt = now;
    totalMs.value = 0;
    questionMs.value = 0;
    stopwatchTick();
  } else {
    questionSegmentStartAt = now;
    questionMs.value = 0;
  }
}

function resetStopwatch() {
  stopwatchRunning.value = false;
  totalMs.value = 0;
  questionMs.value = 0;
  totalStartAt = null;
  questionSegmentStartAt = null;
  publishQuestionAskReset();
  if (stopwatchRafId != null) {
    cancelAnimationFrame(stopwatchRafId);
    stopwatchRafId = null;
  }
}

function teardownStopwatchOnly() {
  stopwatchRunning.value = false;
  totalMs.value = 0;
  questionMs.value = 0;
  totalStartAt = null;
  questionSegmentStartAt = null;
  if (stopwatchRafId != null) {
    cancelAnimationFrame(stopwatchRafId);
    stopwatchRafId = null;
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Shift') {
    shiftHeld.value = true;
  }
  if (e.key === 'Enter' && !e.repeat) {
    startEnterHoldFade();
  }
  if (e.key === 'Escape') {
    fadeOutAll();
    e.preventDefault();
    return;
  }
  if (e.code === 'Space' && e.shiftKey) {
    fadeOutAll();
    e.preventDefault();
    return;
  }
  if (e.metaKey || e.ctrlKey) return;
  const keyCode = e.code;
  const definition = KEY_CODE_TO_DEFINITION.get(keyCode);
  if (!definition?.soundUrl) return;
  e.preventDefault();
  if (e.shiftKey) {
    fadeOut(definition.letter);
  } else {
    play(definition.letter);
  }

  if (definition?.letter) {
    if (e.shiftKey) {
      publishSoundStop(definition.letter);
    } else {
      publishSoundPlay(definition.letter);
    }
  }
}

function handleStop(letter: Letter) {
  if (letter === 'Space') {
    fadeOutAll();
  } else {
    fadeOut(letter);
  }

  publishSoundStop(letter);
}

function handleKeyup(e: KeyboardEvent) {
  if (e.key === 'Shift') {
    shiftHeld.value = false;
  }
  if (e.key === 'Enter') {
    endEnterHoldFade();
  }
}

onMounted(() => {
  preload();
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('keyup', handleKeyup);
  teardownStopwatchOnly();
});
</script>

<template>
  <div class="min-h-screen bg-brown px-4 py-6 select-none">
    <Logo />

    <!-- Desktop: keyboard -->
    <div class="hidden justify-center md:flex">
      <Keyboard
        :loading="loading"
        :rows="QWERTY_ROWS"
        :shift-held="shiftHeld"
        :get-active-plays="getActivePlays"
        :loaded-sounds-count="loadedSoundsCount"
        :total-sounds="totalSounds"
        :all-sounds-loaded="allSoundsLoaded"
        @play="play"
        @stop="handleStop"
      />
    </div>

    <!-- Mobile: grid of sound buttons — leave room for fixed bottom dock -->
    <div
      class="md:hidden"
      :class="
        hasAnyActivePlays
          ? 'pb-[calc(24rem+env(safe-area-inset-bottom))]'
          : 'pb-[calc(20rem+env(safe-area-inset-bottom))]'
      "
    >
      <MobileSoundGrid
        :loading="loading"
        :shift-held="shiftHeld"
        :get-active-plays="getActivePlays"
        :loaded-sounds-count="loadedSoundsCount"
        :total-sounds="totalSounds"
        :all-sounds-loaded="allSoundsLoaded"
        @play="play"
        @stop="handleStop"
      />
    </div>

    <!-- Mobile: fixed bottom dock — pause (when playing), applause, stopwatch -->
    <div
      class="fixed bottom-0 left-0 right-0 z-10 flex flex-col md:hidden shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
      style="padding-bottom: env(safe-area-inset-bottom, 0px)"
    >
      <div
        v-if="hasAnyActivePlays"
        class="flex h-14 shrink-0 items-center justify-center border-t border-orange bg-orange"
      >
        <button
          type="button"
          class="h-full w-full font-medium transition hover:bg-orange/90 active:bg-orange/80"
          style="color: #1a1a1a; touch-action: manipulation"
          aria-label="Pause all sounds"
          @click="fadeOutAll"
        >
          Pause all sounds
        </button>
      </div>

      <div class="flex h-14 shrink-0 items-center justify-center border-t border-orange bg-yellow">
        <button
          type="button"
          class="h-full w-full font-medium transition hover:bg-yellow/90 active:bg-yellow/80"
          style="color: #1a1a1a; touch-action: manipulation"
          aria-label="Applause"
          @click="onApplauseClick"
        >
          Applause
        </button>
      </div>

      <div
        class="border-t border-orange bg-brown px-3 py-3"
        style="touch-action: manipulation"
      >
        <div class="mb-3 flex items-start justify-between gap-4 sm:gap-6">
          <div class="text-left">
            <p class="mb-0.5 text-xs text-yellow/80">Total</p>
            <p class="font-mono text-xl tabular-nums text-white sm:text-2xl">
              {{ formattedTotal }}
            </p>
          </div>
          <div class="text-right">
            <p class="mb-0.5 text-xs text-yellow/80">This question</p>
            <p class="font-mono text-xl tabular-nums text-white sm:text-2xl">
              {{ formattedQuestion }}
            </p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-lg bg-orange px-2 py-2.5 text-sm font-medium transition hover:bg-orange/90 active:bg-orange/80 disabled:opacity-40"
            style="color: #1a1a1a"
            :disabled="stopwatchRunning"
            @click="startStopwatch"
          >
            Start
          </button>
          <button
            type="button"
            class="rounded-lg bg-orange px-2 py-2.5 text-sm font-medium transition hover:bg-orange/90 active:bg-orange/80"
            style="color: #1a1a1a"
            @click="resetStopwatch"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        class="border-t border-orange bg-brown px-2 py-2"
        style="touch-action: manipulation"
      >
        <p class="mb-1.5 text-center text-xs text-yellow/80">Question Tally</p>
        <div class="grid grid-cols-5 gap-1.5">
          <button
            v-for="slot in ASK_SLOTS"
            :key="slot"
            type="button"
            class="flex flex-col items-center justify-center rounded-lg bg-orange py-2 font-medium transition hover:bg-orange/90 active:bg-orange/80"
            style="color: #1a1a1a"
            :aria-label="`Person ${slot} asked, count ${questionAskCounts[slot - 1]}`"
            @click="onQuestionAskClick(slot)"
          >
            <span class="text-lg leading-none">{{ slot }}</span>
            <span class="mt-0.5 font-mono text-xs tabular-nums opacity-90">{{
              questionAskCounts[slot - 1]
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

