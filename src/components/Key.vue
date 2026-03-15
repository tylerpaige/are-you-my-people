<script setup lang="ts">
import type { ActivePlay } from "../composables/useSoundboard";
import type { Letter } from "../lib/config";

withDefaults(
  defineProps<{
    label: string;
    sublabel?: string;
    activePlays?: ActivePlay[];
    letter: Letter;
    disabled?: boolean;
  }>(),
  { activePlays: () => [], letter: "A" as Letter, disabled: false },
);

defineEmits<{
  play: [letter: Letter];
}>();
</script>

<template>
  <button
    type="button"
    class="key-cap relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-100 px-2 py-1.5 text-left shadow-sm transition hover:bg-gray-200 active:bg-gray-300 disabled:pointer-events-none disabled:opacity-50 md:px-3 md:py-2 "
    :disabled="disabled"
    @click="$emit('play', letter)"
  >
    <span class="relative z-10 text-lg font-medium text-gray-800 md:text-xl">{{
      label
    }}</span>
    <span v-if="sublabel" class="relative z-10 truncate text-xs text-gray-500">{{
      sublabel
    }}</span>
    <!-- One overlay per active play; width = progress%; stacked vertically when multiple -->
    <template v-for="(play, i) in activePlays" :key="play.id">
      <div
        class="absolute left-0 z-[1] bg-black/30 transition-[width] duration-75"
        :style="{
          width: `${(play.progress ?? 0) * 100}%`,
          height:
            activePlays.length > 1 ? `${100 / activePlays.length}%` : '100%',
          top:
            activePlays.length > 1 ? `${(i * 100) / activePlays.length}%` : '0',
        }"
        aria-hidden
      />
    </template>
  </button>
</template>
