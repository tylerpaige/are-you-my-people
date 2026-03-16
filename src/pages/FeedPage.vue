<script setup lang="ts">
import Logo from '../components/Logo.vue';
import { KEY_CONFIG, type Letter } from '../lib/config';
import { useFeedConsumer } from '../composables/useRealtimeFeed';

const { currentQuestion, activeLetterDefinitions, activeLettersList } =
  useFeedConsumer();

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
      <div class="text-right text-xs md:text-sm text-yellow/80">
        <p class="font-semibold uppercase tracking-wide">Live feed</p>
        <p class="opacity-80">
          Mirroring questions &amp; sounds from other devices
        </p>
      </div>
    </header>

    <main class="flex-1 flex flex-col gap-10 md:gap-12">
      <!-- Current question -->
      <section
        class="relative flex-1 rounded-2xl bg-yellow/95 text-brown shadow-lg px-6 py-6 md:px-10 md:py-10 flex items-center justify-center"
      >
        <div class="w-full max-w-3xl text-center">
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
