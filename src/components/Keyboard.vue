<script setup lang="ts">
import { computed } from 'vue';
import type { ActivePlay } from '../composables/useSoundboard';
import type { Letter } from '../lib/config';
import Key from './Key.vue';
import { getKeyDefinition } from '../lib/config';

const props = defineProps<{
  loading: boolean;
  rows: Letter[][];
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

const flatLetters = computed(() => props.rows.flat());

function getDelayForLetter(letter: Letter) {
  const index = flatLetters.value.indexOf(letter);
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
    <div class="mb-24 text-sm leading-tight text-yellow/80 max-w-sm">
      <h2 class="text-md font-bold underline mb-1">Instructions</h2>
      <p class="">
        Click a button or use the keyboard to play sounds. Repeat clicks trigger
        multiple plays. Hold <span class="font-bold">shift</span> to silence a
        sound. Press <span class="font-bold">escape</span> to stop all sounds.
      </p>
    </div>

    <!-- Keyboard grid: 4 rows, space bar spans bottom -->
    <div
      :class="
        (loading && 'pointer-events-none opacity-60',
        'grid gap-[--key-gap] [--key-gap:0.5rem] md:[--key-gap:0.5rem] [--flexible-key-size:calc((100%-var(--key-gap)*9)/10)] [--key-size:clamp(2rem,var(--flexible-key-size),6rem)]')
      "
    >
      <template v-for="row in rows" :key="row[0]">
        <div
          class="grid gap-[--key-gap] justify-center"
          :style="{
            gridTemplateColumns: `repeat(${row.length > 1 ? row.length : 5}, var(--key-size))`,
          }"
        >
          <Key
            v-for="letter in row"
            :key="letter"
            :letter="getKeyDefinition(letter).letter"
            :label="getKeyDefinition(letter).label || letter"
            :sublabel="getKeyDefinition(letter).label ? letter : undefined"
            :active-plays="getActivePlays(getKeyDefinition(letter).letter)"
            :disabled="
              letter === 'Space' ? false : !getKeyDefinition(letter).soundUrl
            "
            :shift-held="shiftHeld"
            class="col-span-1 only:col-span-5 aspect-square only:aspect-[5/1]"
            :loading-delay-ms="getDelayForLetter(letter)"
            :animate-loading="true"
            :all-sounds-loaded="allSoundsLoaded"
            @play="onPlay(getKeyDefinition(letter).letter)"
            @stop="onStop(getKeyDefinition(letter).letter)"
          />
        </div>
      </template>
    </div>
  </div>
</template>
