<script setup lang="ts">
import { computed } from 'vue';
import Key from './Key.vue';
import { getKeyDefinition, QWERTY_ROWS, type Letter } from '../lib/config';

const props = defineProps<{
  loading: boolean;
  shiftHeld: boolean;
  getActivePlays: (
    letter: Letter
  ) => { id: string; progress: number; fadeOutProgress?: number }[];
  loadedSoundsCount: number;
  totalSounds: number;
  allSoundsLoaded: boolean;
}>();

const emit = defineEmits<{
  play: [letter: Letter];
  stop: [letter: Letter];
}>();

/** Keys in QWERTY order (row by row), including Space for consistent animation offsets. */
const lettersInQwertyOrder = computed(() => QWERTY_ROWS.flat());

function getDelayForLetter(letter: Letter) {
  const index = lettersInQwertyOrder.value.indexOf(letter);
  if (index === -1) return 0;
  return index * 50;
}

function onPlay(letter: Letter) {
  emit('play', letter);
}

function onStop(letter: Letter) {
  emit('stop', letter);
}
</script>

<template>
  <div class="relative w-full">
    <div class="mt-2 mb-8 text-sm leading-tight text-yellow/80 max-w-sm">
      <h2 class="text-md font-bold underline mb-1">Instructions</h2>
      <p class="">
        Click a button. Repeat clicks trigger multiple plays. When a sound is
        playing, a stop button will appear.
      </p>
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
            :loading-delay-ms="getDelayForLetter(letter)"
            :animate-loading="true"
            :all-sounds-loaded="allSoundsLoaded"
            @play="onPlay(letter)"
            @stop="onStop(letter)"
          />
          <button
            v-if="getKeyDefinition(letter).soundUrl"
            type="button"
            class="absolute bottom-1 right-1 z-10 flex min-h-9 min-w-9 items-center justify-center rounded-md p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-0 [height:max(2.25rem,33%)] [width:max(2.25rem,33%)]"
            :aria-label="
              getActivePlays(letter).length > 0
                ? `Stop ${letter}`
                : `Stop ${letter}; no sound playing`
            "
            :disabled="getActivePlays(letter).length === 0"
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
  </div>
</template>
