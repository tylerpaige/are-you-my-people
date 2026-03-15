<script setup lang="ts">
import type { ActivePlay } from '../composables/useSoundboard';
import type { Letter } from '../lib/config';

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
  {
    activePlays: () => [],
    letter: 'A' as Letter,
    disabled: false,
    shiftHeld: false,
    centerLabel: false,
  }
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
    class="key-cap relative flex flex-col items-center justify-center overflow-hidden rounded-lg border px-2 py-1.5 shadow-sm transition disabled:pointer-events-none disabled:opacity-50 md:px-3 md:py-2 [container-type:size]"
    :class="[
      centerLabel ? 'text-center' : 'text-left',
      shiftHeld && !disabled
        ? 'border-key-shift bg-key-shift hover:bg-key-shift/90 active:bg-key-shift/80 ring-2 ring-key-shift/50'
        : 'border-gray-300 bg-key-bg hover:bg-key-bg/90 active:bg-key-bg/80',
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
      <span
        class="relative z-10 text-center text-sm font-medium md:text-base"
        style="color: #1a1a1a"
      >
        Stop all sounds
      </span>
    </template>
    <template v-else>
      <span
        class="relative z-10 font-medium text-gray-800 [font-size:clamp(0.5rem,45cqw,4rem)] leading-none"
        >{{ label }}</span
      >
      <span
        v-if="sublabel && !(shiftHeld && !disabled)"
        class="relative z-10 truncate text-xs text-gray-500"
        >{{ sublabel }}</span
      >
      <span
        v-if="shiftHeld && !disabled"
        class="relative z-10 text-xs font-medium"
        style="color: #1a1a1a"
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
