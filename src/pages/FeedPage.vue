<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import gsap from 'gsap';
import Logo from '../components/Logo.vue';
import { useFeedConsumer } from '../composables/useRealtimeFeed';
import {
  createFeedLogo70sTimeline,
  FEED_LOGO_70S_DEFAULT_TIMINGS,
} from '../lib/createFeedLogo70sTimeline';

const { lastApplauseAt, feedDisplayMode } = useFeedConsumer();

const DEFAULT_BACKGROUND_IFRAME_URL =
  'https://www.youtube.com/embed/iAtNl85CCIg?autoplay=1&mute=1&loop=1&controls=0&playlist=iAtNl85CCIg&modestbranding=1&playsinline=1&rel=0&fs=0&disablekb=1';
const COMMERCIAL_BREAK_IFRAME_URL =
  'https://www.youtube.com/embed/3MVpB-zsg5o?autoplay=1&mute=1&loop=1&controls=0&playlist=3MVpB-zsg5o&modestbranding=1&playsinline=1&rel=0&fs=0&disablekb=1';
const CREDITS_IFRAME_URL =
  'https://www.youtube.com/embed/94QY6AUHuxs?autoplay=1&mute=1&loop=1&controls=0&playlist=94QY6AUHuxs&modestbranding=1&playsinline=1&rel=0&fs=0&disablekb=1';

const feedIframeUrl = computed(() =>
  feedDisplayMode.value === 'commercials'
    ? COMMERCIAL_BREAK_IFRAME_URL
    : feedDisplayMode.value === 'credits'
      ? CREDITS_IFRAME_URL
      : DEFAULT_BACKGROUND_IFRAME_URL
);

const showApplauseFlash = ref(false);
let applauseFlashTimer: ReturnType<typeof setTimeout> | null = null;

/** Tweak timings here or pass a partial override to `createFeedLogo70sTimeline`. */
const feedLogoTimings = { ...FEED_LOGO_70S_DEFAULT_TIMINGS };

const feedLogoEl = ref<HTMLElement | null>(null);
let feedLogoTimeline: gsap.core.Timeline | null = null;
let motionMql: MediaQueryList | null = null;

function stopFeedLogoAnim() {
  if (feedLogoTimeline) {
    feedLogoTimeline.kill();
    feedLogoTimeline = null;
  }
  const el = feedLogoEl.value;
  if (el) gsap.killTweensOf(el);
}

function startFeedLogoAnim() {
  stopFeedLogoAnim();
  const el = feedLogoEl.value;
  if (!el || showApplauseFlash.value) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(el, {
      position: 'fixed',
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
      opacity: 1,
      scale: 1,
      rotation: 0,
      x: 0,
      y: 0,
      zIndex: 20,
    });
    return;
  }

  feedLogoTimeline = createFeedLogo70sTimeline(el, feedLogoTimings);
}

function onReducedMotionChange() {
  if (!showApplauseFlash.value) {
    nextTick(() => startFeedLogoAnim());
  }
}

watch(
  () => [showApplauseFlash.value, feedLogoEl.value] as const,
  ([flash, el]) => {
    if (flash || !el) {
      stopFeedLogoAnim();
      return;
    }
    nextTick(() => {
      if (feedLogoEl.value !== el) return;
      startFeedLogoAnim();
    });
  },
  { flush: 'post', immediate: true }
);

watch(lastApplauseAt, () => {
  if (lastApplauseAt.value == null) return;
  showApplauseFlash.value = true;
  if (applauseFlashTimer) clearTimeout(applauseFlashTimer);
  applauseFlashTimer = setTimeout(() => {
    showApplauseFlash.value = false;
    applauseFlashTimer = null;
  }, 4500);
});

onMounted(() => {
  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionMql.addEventListener('change', onReducedMotionChange);
});

onUnmounted(() => {
  motionMql?.removeEventListener('change', onReducedMotionChange);
  motionMql = null;
  stopFeedLogoAnim();
  if (applauseFlashTimer) clearTimeout(applauseFlashTimer);
});
</script>

<template>
  <div
    class="min-h-screen bg-brown text-white flex flex-col justify-center items-center select-none overflow-hidden"
  >
    <!-- Commercials / credits -->
    <div
      v-if="feedDisplayMode !== 'show'"
      class="absolute inset-0 bg-black overflow-hidden"
    >
      <iframe
        class="absolute aspect-4/3 left-1/2 top-1/2 z-0 pointer-events-none -translate-x-1/2 -translate-y-1/2 orientation-lt-video:h-full orientation-lt-video:w-auto orientation-gte-video:w-full orientation-gte-video:h-auto"
        :src="feedIframeUrl"
        title="Background video"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
      ></iframe>
    </div>

    <template v-else>
      <!-- Background YouTube video -->
      <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
        <iframe
          class="absolute aspect-video left-1/2 top-1/2 z-0 opacity-20 pointer-events-none -translate-x-1/2 -translate-y-1/2 orientation-lt-video:h-full orientation-lt-video:w-auto orientation-gte-video:w-full orientation-gte-video:h-auto"
          :src="feedIframeUrl"
          title="Background video"
          frameborder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
        ></iframe>
      </div>

      <!-- Foreground content -->
      <div class="relative z-10">
        <Transition
          enter-active-class="transition duration-300 ease-out"
          leave-active-class="transition duration-500 ease-in"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
          v-if="showApplauseFlash"
        >
          <p
            class="mb-4 font-sans text-2xl font-semibold tracking-wide text-yellow md:text-8xl"
            aria-live="polite"
          >
            <span class="inline-block animate-applause-blink">[Applause]</span>
          </p>
        </Transition>
        <div v-if="!showApplauseFlash" ref="feedLogoEl" class="feed-logo-70s">
          <Logo size="large" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.feed-logo-70s {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 20;
  transform-origin: center center;
}

@media (prefers-reduced-motion: reduce) {
  .feed-logo-70s {
    transform: translate(-50%, -50%);
  }
}
</style>
