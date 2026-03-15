<script setup lang="ts">
import type { Letter } from "../lib/config";
import Key from "./Key.vue";
import { getKeyDefinition } from "../lib/config";

defineProps<{
  loading: boolean;
  rows: Letter[][];
  getActivePlays: (letter: Letter) => { id: string; progress: number }[];
}>();

const emit = defineEmits<{
  play: [letter: Letter];
}>();

function onPlay(letter: Letter) {
  emit("play", letter);
}
</script>

<template>
  <div class="relative w-full max-w-3xl">
    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-xl bg-gray-100/90"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600"
        aria-hidden
      />
      <p class="text-sm font-medium text-gray-600">Loading sounds…</p>
    </div>

    <!-- Keyboard grid: 4 rows, space bar spans bottom -->
    <div
      :class="
        (loading && 'pointer-events-none opacity-60',
        'grid gap-[--key-gap] [--key-gap:0.5rem] md:[--key-gap:0.5rem] [--flexible-key-size:calc((100%-var(--key-gap)*9)/10)] [--key-size:clamp(2rem,var(--flexible-key-size),6rem)]')
      "
    >
      <template v-for="(row, rowIndex) in rows" :key="rowIndex">
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
            :disabled="!getKeyDefinition(letter).soundUrl"
            class="col-span-1 only:col-span-5 aspect-square only:aspect-[5/1]"
            @play="onPlay(getKeyDefinition(letter).letter)"
          />
        </div>
      </template>
    </div>
  </div>
</template>
