<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import gsap from 'gsap';
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
    /** Loading animation options */
    animateLoading?: boolean;
    loadingDelayMs?: number;
    allSoundsLoaded?: boolean;
  }>(),
  {
    activePlays: () => [],
    letter: 'A' as Letter,
    disabled: false,
    shiftHeld: false,
    centerLabel: false,
    animateLoading: false,
    loadingDelayMs: 0,
    allSoundsLoaded: false,
  }
);

const emit = defineEmits<{
  play: [letter: Letter];
  stop: [letter: Letter];
}>();

/** When true: finish the current cycle, then settle to key-bg and stop (no more loops). */
const shouldStopAfterCycle = ref(false);
const loadingAnimationStopped = ref(false);
const keyEl = ref<HTMLElement | null>(null);
let loadingTimeline: gsap.core.Timeline | null = null;

function getPlayColorClass(play: ActivePlay) {
  const bucket = play.colorIndex % 4;
  if (bucket === 0) return 'bg-blue';
  if (bucket === 1) return 'bg-green';
  if (bucket === 2) return 'bg-yellow';
  return 'bg-red/40';
}

function killLoadingTimeline() {
  if (loadingTimeline) {
    loadingTimeline.kill();
    loadingTimeline = null;
  }
}

function settleToFinalKeyBg() {
  const target = keyEl.value;
  if (target) {
    gsap.to(target, {
      backgroundColor: 'rgba(235, 238, 210, 1)',
      duration: 0.6,
      ease: 'power1.inOut',
      onComplete: () => {
        // Let Tailwind-controlled classes own the final background color
        target.style.removeProperty('background-color');
      },
    });
  }
  loadingAnimationStopped.value = true;
  killLoadingTimeline();
}

function setupLoadingTimeline() {
  if (!props.animateLoading || !keyEl.value) return;

  killLoadingTimeline();
  shouldStopAfterCycle.value = false;
  loadingAnimationStopped.value = false;

  const el = keyEl.value;
  const baseColor = 'rgba(235, 238, 210, 0.2)'; // key-bg/20

  // Always loop at least once; we switch to "one more cycle then stop" when allSoundsLoaded.
  loadingTimeline = gsap.timeline({
    repeat: -1,
    delay: (props.loadingDelayMs ?? 0) / 1000,
    defaults: { duration: 0.35, ease: 'power1.inOut' },
    onComplete: () => {
      // After each full cycle: if we were told to stop (loading done), settle and stop.
      if (shouldStopAfterCycle.value) {
        settleToFinalKeyBg();
      }
    },
  });

  loadingTimeline
    .set(el, { backgroundColor: baseColor })
    .to(el, { backgroundColor: '#9bc8e5' }) // blue
    .to(el, { backgroundColor: '#a0dd87' }) // green
    .to(el, { backgroundColor: '#f70000' }) // red
    .to(el, { backgroundColor: '#faea3e' }) // yellow
    .to(el, { backgroundColor: baseColor }); // back to 30% key-bg

  // If sounds are already all loaded, request stop after this one full cycle (at least one cycle always runs).
  if (props.allSoundsLoaded) {
    shouldStopAfterCycle.value = true;
    loadingTimeline.repeat(0);
  }
}

watch(
  () => props.animateLoading,
  (val) => {
    if (val) {
      setupLoadingTimeline();
    } else {
      killLoadingTimeline();
    }
  },
  { immediate: true }
);

watch(
  () => props.allSoundsLoaded,
  (val) => {
    if (!val || !loadingTimeline) return;
    // Loading just finished: finish the current full cycle, then settle (waterfall end).
    shouldStopAfterCycle.value = true;
    if (loadingTimeline.repeat() === -1) {
      loadingTimeline.repeat(0);
    }
  }
);

onMounted(() => {
  if (props.animateLoading && keyEl.value && !loadingTimeline) {
    setupLoadingTimeline();
  }
});

onBeforeUnmount(() => {
  killLoadingTimeline();
});

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
    ref="keyEl"
    type="button"
    class="key-cap relative flex flex-col items-center justify-center overflow-hidden rounded-lg px-2 py-1.5 shadow-sm disabled:pointer-events-none disabled:opacity-50 md:px-3 md:py-2 [container-type:size]"
    :class="[
      centerLabel ? 'text-center' : 'text-left',
      shiftHeld && !disabled
        ? ' bg-key-shift hover:bg-key-shift/90 active:bg-key-shift/80 ring-2 ring-key-shift/50'
        : loadingAnimationStopped
          ? ' bg-key-bg hover:bg-key-bg/90 active:bg-key-bg/80'
          : ' bg-key-bg/20 hover:bg-key-bg/90 active:bg-key-bg/80',
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
      <div
        class="relative z-10 flex flex-col items-center"
        :style="{
          opacity: !animateLoading || loadingAnimationStopped ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
          transitionDelay:
            animateLoading && loadingAnimationStopped
              ? `${loadingDelayMs}ms`
              : '0s',
        }"
      >
        <span
          class="font-medium text-gray-800 [font-size:clamp(0.5rem,45cqw,4rem)] leading-none"
          >{{ label }}</span
        >
        <span
          v-if="sublabel && !(shiftHeld && !disabled)"
          class="truncate text-xs text-gray-500"
          >{{ sublabel }}</span
        >
      </div>
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
        class="absolute left-0 z-[1] transition-[width] duration-75"
        :class="getPlayColorClass(play)"
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
