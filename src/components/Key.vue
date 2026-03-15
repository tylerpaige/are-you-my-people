<script setup lang="ts">
import type { ActivePlay } from "../composables/useSoundboard";
import type { Letter } from "../lib/config";

const props = withDefaults(
  defineProps<{
    label: string;
    sublabel?: string;
    activePlays?: ActivePlay[];
    letter: Letter;
    disabled?: boolean;
    shiftHeld?: boolean;
    centerLabel?: boolean;
  }>(),
  { activePlays: () => [], letter: "A" as Letter, disabled: false, shiftHeld: false, centerLabel: false },
);

const emit = defineEmits<{
  play: [letter: Letter];
  stop: [letter: Letter];
}>();

function onClick(e: MouseEvent) {
  if (e.shiftKey) {
    emit('stop', props.letter);
  } else {
    emit('play', props.letter);
  }
}
</script>

<template>
  <button
    type="button"
    class="key-cap relative flex flex-col items-center justify-center overflow-hidden rounded-lg border px-2 py-1.5 shadow-sm transition disabled:pointer-events-none disabled:opacity-50 md:px-3 md:py-2"
    :class="[
      centerLabel ? 'text-center' : 'text-left',
      props.letter === 'Space' && props.shiftHeld
        ? 'border-yellow-500 bg-yellow-100 hover:bg-yellow-200 active:bg-yellow-300 ring-2 ring-yellow-500/50'
        : shiftHeld && !disabled
          ? 'border-amber-500 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 ring-2 ring-amber-500/50'
          : 'border-gray-300 bg-gray-100 hover:bg-gray-200 active:bg-gray-300',
    ]"
    :disabled="disabled"
    :title="
      props.letter === 'Space' && props.shiftHeld
        ? 'Click to stop all sounds'
        : shiftHeld && !disabled
          ? 'Click to silence this sound'
          : undefined
    "
    @click="onClick"
  >
    <template v-if="props.letter === 'Space' && props.shiftHeld">
      <span class="relative z-10 text-center text-sm font-medium text-yellow-800 md:text-base">
        Stop all sounds
      </span>
    </template>
    <template v-else>
      <span class="relative z-10 text-lg font-medium text-gray-800 md:text-xl">{{
        label
      }}</span>
      <span v-if="sublabel && !(shiftHeld && !disabled)" class="relative z-10 truncate text-xs text-gray-500">{{
        sublabel
      }}</span>
      <span
        v-if="shiftHeld && !disabled"
        class="relative z-10 text-xs font-medium text-amber-700"
      >
        Silence
      </span>
    </template>
    <!-- One overlay per active play; width = progress%; opacity fades in sync with audio fadeout -->
    <template v-for="(play, i) in activePlays" :key="play.id">
      <div
        class="absolute left-0 z-[1] bg-black/30 transition-[width] duration-75"
        :style="{
          width: `${(play.progress ?? 0) * 100}%`,
          height:
            activePlays.length > 1 ? `${100 / activePlays.length}%` : '100%',
          top:
            activePlays.length > 1 ? `${(i * 100) / activePlays.length}%` : '0',
          opacity: 1 - (play.fadeOutProgress ?? 0),
        }"
        aria-hidden
      />
    </template>
  </button>
</template>
