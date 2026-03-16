<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import gsap from 'gsap';
import Logo from '../components/Logo.vue';
import QuestionCard from '../components/QuestionCard.vue';
import QuestionControls from '../components/QuestionControls.vue';
import { QUESTIONS } from '../lib/config';

interface CardColor {
  background: string;
  text: string;
  nextGlow: string;
}
const COLORS: CardColor[] = [
  { background: 'bg-blue', text: 'text-black', nextGlow: 'to-green' },
  { background: 'bg-green', text: 'text-brown', nextGlow: 'to-yellow' },
  { background: 'bg-yellow', text: 'text-brown', nextGlow: 'to-orange' },
  { background: 'bg-orange', text: 'text-brown', nextGlow: 'to-red' },
  { background: 'bg-red', text: 'text-white', nextGlow: 'to-blue' },
];

const currentIndex = ref(0);
const displayIndex = ref(0);
const direction = ref<'next' | 'prev'>('next');
const isAnimating = ref(false);
const exitingIndex = ref<number | null>(null);
const askedIndices = ref<number[]>([]);
const cardEl = ref<HTMLElement | null>(null);
const leftGlowEl = ref<HTMLElement | null>(null);
const rightGlowEl = ref<HTMLElement | null>(null);
const backgroundIndex = ref(0);

const hasQuestions = computed(() => QUESTIONS.length > 0);

const foregroundIndex = computed(() =>
  exitingIndex.value !== null ? exitingIndex.value : displayIndex.value
);

const foregroundQuestion = computed(() =>
  hasQuestions.value ? QUESTIONS[foregroundIndex.value % QUESTIONS.length] : ''
);

const nextIndex = computed(() => {
  if (!hasQuestions.value) return 0;
  return (currentIndex.value + 1) % QUESTIONS.length;
});

function getQuestion(index: number): string {
  if (!hasQuestions.value) return '';
  return QUESTIONS[index % QUESTIONS.length]!;
}

function getCardColor(index: number): CardColor {
  if (!hasQuestions.value) return COLORS[0]!;
  const idx = index % COLORS.length;
  return COLORS[idx]!;
}

function isAsked(index: number): boolean {
  return askedIndices.value.includes(index % QUESTIONS.length);
}

function markAsked(index: number) {
  const normalized = index % QUESTIONS.length;
  if (!askedIndices.value.includes(normalized)) {
    askedIndices.value = [...askedIndices.value, normalized];
  }
}

function animateToIndex(
  targetIndex: number,
  dir: 'next' | 'prev',
  options?: { markAskedAfterExit?: boolean; sourceIndex?: number }
) {
  if (!hasQuestions.value || isAnimating.value) return;
  const el = cardEl.value;
  if (!el) {
    if (options?.markAskedAfterExit && options.sourceIndex != null) {
      markAsked(options.sourceIndex);
    }
    currentIndex.value = (targetIndex + QUESTIONS.length) % QUESTIONS.length;
    displayIndex.value = currentIndex.value;
    return;
  }

  const normalizedTarget = (targetIndex + QUESTIONS.length) % QUESTIONS.length;

  isAnimating.value = true;
  direction.value = dir;
  // The card that is currently visible becomes the exiting card.
  exitingIndex.value = displayIndex.value;
  // Immediately prepare the next card underneath so it is visible
  // as soon as the exiting animation begins.
  backgroundIndex.value = normalizedTarget;
  // Logically advance to the target card right away so all computed
  // values (like next/previous indices and glows) are up to date,
  // while the exiting card still appears on top via `foregroundIndex`.
  currentIndex.value = normalizedTarget;
  displayIndex.value = normalizedTarget;

  const offDeck =
    dir === 'next'
      ? { x: -120, y: -120, rotate: -90 }
      : { x: 120, y: 40, rotate: 15 };

  const tl = gsap.timeline({
    onComplete: () => {
      if (options?.markAskedAfterExit && options.sourceIndex != null) {
        markAsked(options.sourceIndex);
      }
      isAnimating.value = false;
      exitingIndex.value = null;
    },
  });

  // Phase 1: old card on top, moves off deck entirely.
  tl.set(el, { zIndex: 40 });
  tl.to(el, {
    ...offDeck,
    duration: 0.22,
    ease: 'power2.inOut',
  });

  // At peak offset, drop exiting card under the deck so the next
  // background card visually becomes the top of the pile.
  tl.add(() => {
    gsap.set(el, { zIndex: 5 });
  });

  // Phase 2: old card settles back to deck position underneath.
  tl.to(el, {
    x: 0,
    y: 0,
    rotate: 0,
    duration: 0.22,
    ease: 'power2.inOut',
  });
}

function skipCurrent() {
  if (!hasQuestions.value) return;
  animateToIndex(nextIndex.value, 'next');
}

function markAskedAndNext() {
  if (!hasQuestions.value) return;
  animateToIndex(nextIndex.value, 'next', {
    markAskedAfterExit: true,
    sourceIndex: currentIndex.value,
  });
}

function triggerGlow(side: 'left' | 'right') {
  const el = side === 'left' ? leftGlowEl.value : rightGlowEl.value;
  if (!el) return;
  gsap.fromTo(
    el,
    { opacity: 0 },
    { opacity: 0.4, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 }
  );
}

function handleKeydown(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    triggerGlow('right');
    markAskedAndNext();
    return;
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    triggerGlow('left');
    skipCurrent();
    return;
  }

  if (e.code === 'Space' || e.key === ' ') {
    e.preventDefault();
    if (e.shiftKey) {
      triggerGlow('left');
      skipCurrent();
    } else {
      triggerGlow('right');
      markAskedAndNext();
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div
    class="min-h-screen bg-brown text-white flex flex-col select-none overflow-hidden p-4 md:p-8"
    style="touch-action: manipulation"
  >
    <!-- Glow overlays: fixed to viewport edges, full screen height -->
    <div
      ref="leftGlowEl"
      class="pointer-events-none fixed inset-y-0 left-0 w-1/3 opacity-0 bg-linear-to-l from-transparent"
      :class="getCardColor(backgroundIndex).nextGlow"
      style="z-index: 35"
    />
    <div
      ref="rightGlowEl"
      class="pointer-events-none fixed inset-y-0 right-0 w-1/3 opacity-0 bg-linear-to-r from-transparent"
      :class="getCardColor(nextIndex).nextGlow"
      style="z-index: 35"
    />

    <!-- Card area -->
    <div class="relative flex-1 flex items-stretch">
      <!-- Background card: shows the card that will be revealed underneath -->
      <div
        v-if="hasQuestions"
        class="absolute inset-0 rounded-xl flex items-center w-full"
        :class="[getCardColor(backgroundIndex).background]"
        :style="{
          filter:
            isAsked(backgroundIndex) &&
            !(exitingIndex !== null && backgroundIndex === exitingIndex)
              ? 'grayscale(1) contrast(1.25)'
              : 'none',
          zIndex: 10,
        }"
      >
        <QuestionCard
          :question="getQuestion(backgroundIndex)"
          :color-class="getCardColor(backgroundIndex).background"
          :text-color-class="getCardColor(backgroundIndex).text"
          :asked="isAsked(backgroundIndex)"
        />
      </div>

      <!-- Foreground card: current question, animated with GSAP -->
      <div
        v-if="hasQuestions"
        ref="cardEl"
        class="absolute inset-0 rounded-xl flex items-center w-full origin-bottom-left"
        :class="[getCardColor(foregroundIndex).background]"
        :style="{
          filter:
            isAsked(foregroundIndex) &&
            !(exitingIndex !== null && exitingIndex === foregroundIndex)
              ? 'grayscale(1) contrast(1.25)'
              : 'none',
          zIndex: 30,
        }"
      >
        <QuestionCard
          :question="foregroundQuestion!"
          :color-class="getCardColor(foregroundIndex).background"
          :text-color-class="getCardColor(foregroundIndex).text"
          :asked="isAsked(foregroundIndex)"
        />
      </div>

      <!-- Empty-state fallback when there are no questions -->
      <div
        v-else
        class="absolute inset-0 rounded-xl shadow-lg flex items-center w-full bg-blue text-brown"
      >
        <div class="px-6 md:px-10 py-8 w-full">
          <p class="font-sans text-left text-lg md:text-2xl leading-relaxed">
            Add some questions to <code>QUESTIONS</code> in
            <code>src/lib/config.ts</code> to get started.
          </p>
        </div>
      </div>

      <!-- Large tap areas for touch / click -->
      <button
        type="button"
        class="absolute inset-y-0 left-0 w-1/4 bg-transparent outline-hidden border-none cursor-pointer z-40"
        style="touch-action: manipulation"
        aria-label="Skip question"
        @click="
          () => {
            triggerGlow('left');
            skipCurrent();
          }
        "
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 w-1/4 bg-transparent outline-hidden border-none cursor-pointer z-40"
        style="touch-action: manipulation"
        aria-label="Mark asked and go to next question"
        @click="
          () => {
            triggerGlow('right');
            markAskedAndNext();
          }
        "
      />
    </div>

    <!-- Bottom controls: skip / logo / asked -->
    <QuestionControls
      @skip="
        () => {
          skipCurrent();
        }
      "
      @asked="
        () => {
          markAskedAndNext();
        }
      "
    >
      <template #logo>
        <Logo />
      </template>
    </QuestionControls>
  </div>
</template>
