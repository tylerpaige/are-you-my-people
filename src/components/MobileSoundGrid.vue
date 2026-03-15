<script setup lang="ts">
import Key from './Key.vue';
import { getKeyDefinition, type Letter } from '../lib/config';

defineProps<{
  loading: boolean;
  letters: Letter[];
  getActivePlays: (letter: Letter) => { id: string; progress: number }[];
}>();

const emit = defineEmits<{
  play: [letter: Letter];
}>();

function onPlay(letter: Letter) {
  emit('play', letter);
}
</script>

<template>
  <div class="relative w-full">
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

    <div
      class="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4"
      :class="loading && 'pointer-events-none opacity-60'"
    >
      <template
        v-for="letter in letters"
        :key="letter"
      >
        <Key
          :letter="getKeyDefinition(letter).letter"
          :label="getKeyDefinition(letter).label || letter"
          :active-plays="getActivePlays(letter)"
          :disabled="!getKeyDefinition(letter).soundUrl"
          class="col-span-1"
          @play="onPlay(letter)"
        />
      </template>
    </div>
  </div>
</template>
