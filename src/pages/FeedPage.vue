<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import Logo from '../components/Logo.vue';
import { KEY_CONFIG, type Letter } from '../lib/config';
import { useFeedConsumer } from '../composables/useRealtimeFeed';

const {
  currentQuestion,
  activeLetterDefinitions,
  activeLettersList,
  lastApplauseAt,
} = useFeedConsumer();

const showApplauseFlash = ref(false);
let applauseFlashTimer: ReturnType<typeof setTimeout> | null = null;

watch(lastApplauseAt, () => {
  if (lastApplauseAt.value == null) return;
  showApplauseFlash.value = true;
  if (applauseFlashTimer) clearTimeout(applauseFlashTimer);
  applauseFlashTimer = setTimeout(() => {
    showApplauseFlash.value = false;
    applauseFlashTimer = null;
  }, 2800);
});

onUnmounted(() => {
  if (applauseFlashTimer) clearTimeout(applauseFlashTimer);
});

function getDisplayLabel(letter: Letter) {
  const def = KEY_CONFIG[letter];
  return def?.label || letter;
}
</script>

<template>
  <div
    class="min-h-screen bg-brown text-white flex flex-col select-none overflow-hidden px-4 py-6 md:px-8 md:py-10"
  >
    <header class="mb-10 flex items-center justify-between gap-4">
      <Logo />
    </header>

    <main class="flex-1 flex flex-col gap-10 md:gap-12">
      <!-- Current question -->
      <section
        class="relative flex-1 rounded-2xl overflow-hidden text-[white] shadow-lg px-6 py-6 md:px-10 md:py-10 flex items-center justify-center"
      >
        <!-- Background YouTube video -->
        <div
          class="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <iframe
            class="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2"
            src="https://www.youtube.com/embed/iAtNl85CCIg?autoplay=1&mute=1&loop=1&controls=0&playlist=iAtNl85CCIg&modestbranding=1&playsinline=1&rel=0&fs=0&disablekb=1"
            title="Background video"
            frameborder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
          ></iframe>
        </div>

        <!-- Foreground content -->
        <div class="relative z-10 w-full max-w-3xl text-center">
          <Transition
            enter-active-class="transition duration-300 ease-out"
            leave-active-class="transition duration-500 ease-in"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <p
              v-if="showApplauseFlash"
              class="mb-4 font-sans text-2xl font-semibold tracking-wide text-yellow md:text-3xl"
              aria-live="polite"
            >
              Applause
            </p>
          </Transition>
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-[0.16em]">
            Current question
          </h2>
          <p
            v-if="currentQuestion"
            class="whitespace-pre-wrap font-sans text-lgleading-tight md:text-2xl"
          >
            {{ currentQuestion }}
          </p>
          <p
            v-else
            class="font-sans text-lg leading-relaxed md:text-2xl md:leading-relaxed opacity-70"
          >
            Waiting for a question&mdash;open the questions view on another
            device to get started.
          </p>
        </div>
      </section>

      <!-- Currently playing sounds -->
      <section class="mt-auto">
        <div class="mb-2 flex items-center justify-between text-xs md:text-sm">
          <h2 class="font-semibold uppercase tracking-[0.16em] text-yellow/80">
            Sounds playing now
          </h2>
          <p class="text-yellow/60">
            {{
              activeLettersList.length === 0
                ? 'No sounds playing'
                : activeLettersList.length === 1
                  ? '1 sound playing'
                  : `${activeLettersList.length} sounds playing`
            }}
          </p>
        </div>

        <div
          v-if="activeLetterDefinitions.length > 0"
          class="flex flex-wrap gap-2 rounded-2xl bg-black/10 px-3 py-3 md:px-4 md:py-4"
        >
          <div
            v-for="def in activeLetterDefinitions"
            :key="def.letter"
            class="inline-flex items-center gap-2 rounded-full bg-blue/80 px-3 py-1.5 text-sm md:text-base shadow-sm"
          >
            <span class="text-lg leading-none">
              {{ getDisplayLabel(def.letter) }}
            </span>
            <span class="text-xs uppercase tracking-[0.14em] opacity-80">
              {{ def.letter === 'Space' ? 'Space' : def.letter }}
            </span>
          </div>
        </div>
        <div
          v-else
          class="rounded-2xl bg-black/10 px-4 py-4 text-sm md:text-base text-yellow/70"
        >
          When someone plays sounds on another device, they will appear here in
          real time.
        </div>
      </section>
    </main>
  </div>
</template>
