<script setup lang="ts">
import { computed } from 'vue';
import type { ActivePlay } from '../composables/useSoundboard';
import Key from './Key.vue';
import { getKeyDefinition, QWERTY_ROWS, type Letter } from '../lib/config';

const props = defineProps<{
  loading: boolean;
  shiftHeld: boolean;
  getActivePlays: (letter: Letter) => ActivePlay[];
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

/** Mobile grid: only keys that have a sound and are not marked hidden. */
const lettersToShow = computed(() =>
  lettersInQwertyOrder.value
    .filter((letter) => {
      const def = getKeyDefinition(letter);
      return Boolean(def.soundUrl) && !def.hidden;
    })
    .reverse()
);

function getDelayForLetter(letter: Letter) {
  const index = lettersToShow.value.indexOf(letter);
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
    <div class="mt-2 mb-8 max-w-sm text-sm leading-tight text-yellow/80">
      <h2 class="mb-1 text-md font-bold underline">Instructions</h2>
      <p class="">
        Tap a button to play a sound; tap repeatedly to layer multiple plays.
        Long-press a button to silence its sound.
      </p>
    </div>

    <!-- 4 square keys per row; label/sublabel centered; fadeout inset bottom-right at 1/4 size -->
    <div
      class="grid grid-cols-3 gap-3 sm:grid-cols-4"
      :class="{
        'pointer-events-none opacity-60': loading,
      }"
    >
      <template v-for="letter in lettersToShow" :key="letter">
        <div class="relative aspect-square">
          <Key
            :letter="getKeyDefinition(letter).letter"
            :name="getKeyDefinition(letter).name"
            :label="getKeyDefinition(letter).label || letter"
            :active-plays="getActivePlays(letter)"
            :shift-held="shiftHeld"
            center-label
            class="absolute inset-0 h-full w-full rounded-lg"
            :loading-delay-ms="getDelayForLetter(letter)"
            :animate-loading="true"
            :all-sounds-loaded="allSoundsLoaded"
            @play="onPlay(letter)"
            @stop="onStop(letter)"
          />
        </div>
      </template>
    </div>
  </div>
</template>
