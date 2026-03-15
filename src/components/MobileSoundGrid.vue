<script setup lang="ts">
import { computed } from 'vue';
import Key from './Key.vue';
import { getKeyDefinition, QWERTY_ROWS, type Letter } from '../lib/config';

const props = defineProps<{
  loading: boolean;
  shiftHeld: boolean;
  hasAnyActivePlays: boolean;
  getActivePlays: (
    letter: Letter
  ) => { id: string; progress: number; fadeOutProgress?: number }[];
}>();

const emit = defineEmits<{
  play: [letter: Letter];
  stop: [letter: Letter];
}>();

/** Keys in QWERTY order (row by row), excluding Space (fixed bar). */
const lettersInQwertyOrder = computed(() =>
  QWERTY_ROWS.flat().filter((l) => l !== 'Space')
);

function onPlay(letter: Letter) {
  emit('play', letter);
}

function onStop(letter: Letter) {
  emit('stop', letter);
}
</script>

<template>
  <div class="relative w-full" :class="props.hasAnyActivePlays && 'pb-14'">
    <div
      class="mt-8 mb-8 text-sm leading-tight text-yellow/80 max-w-sm mx-auto"
    >
      <h2 class="text-md font-bold underline mb-1">Instructions</h2>
      <p class="">
        Click a button. Repeat clicks trigger multiple plays. When a sound is
        playing, a stop button will appear.
      </p>
    </div>

    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-xl bg-gray-100/90 py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600"
        aria-hidden
      />
      <p class="text-sm font-medium text-gray-600">Loading sounds…</p>
    </div>

    <!-- 4 square keys per row; label/sublabel centered; fadeout inset bottom-right at 1/4 size -->
    <div
      class="grid grid-cols-4 gap-3"
      :class="loading && 'pointer-events-none opacity-60'"
    >
      <template v-for="letter in lettersInQwertyOrder" :key="letter">
        <div class="relative aspect-square">
          <Key
            :letter="getKeyDefinition(letter).letter"
            :label="getKeyDefinition(letter).label || letter"
            :active-plays="getActivePlays(letter)"
            :disabled="!getKeyDefinition(letter).soundUrl"
            :shift-held="shiftHeld"
            center-label
            class="absolute inset-0 h-full w-full rounded-lg"
            @play="onPlay(letter)"
            @stop="onStop(letter)"
          />
          <button
            v-if="getKeyDefinition(letter).soundUrl"
            type="button"
            class="absolute bottom-1 right-1 z-10 flex min-h-9 min-w-9 items-center justify-center rounded-md p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-0 [height:max(2.25rem,33%)] [width:max(2.25rem,33%)]"
            :aria-label="
              getActivePlays(letter).length > 0
                ? `Stop ${letter}`
                : `Stop ${letter}; no sound playing`
            "
            @click.stop="onStop(letter)"
          >
            <svg
              class="h-full w-full"
              :class="
                getActivePlays(letter).length > 0
                  ? 'opacity-100 text-red-500'
                  : 'opacity-0'
              "
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
              />
              <rect x="8" y="8" width="8" height="8" fill="currentColor" />
            </svg>
          </button>
        </div>
      </template>
    </div>

    <!-- Fixed bottom: Stop all sounds (mobile only), only when something is playing -->
    <div
      v-if="props.hasAnyActivePlays"
      class="fixed bottom-0 left-0 right-0 z-10 flex h-14 items-center justify-center border-t border-key-shift bg-key-shift shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
    >
      <button
        type="button"
        class="h-full w-full font-medium transition hover:bg-key-shift/90 active:bg-key-shift/80"
        style="color: #1a1a1a"
        aria-label="Stop all sounds"
        @click="onStop('Space')"
      >
        Stop all sounds
      </button>
    </div>
  </div>
</template>
