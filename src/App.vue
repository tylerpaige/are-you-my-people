<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Keyboard from './components/Keyboard.vue';
import MobileSoundGrid from './components/MobileSoundGrid.vue';
import { useSoundboard } from './composables/useSoundboard';
import { KEY_CODE_TO_DEFINITION, QWERTY_ROWS, type Letter } from './lib/config';

const {
  loading,
  preload,
  play,
  fadeOut,
  fadeOutAll,
  getActivePlays,
  hasAnyActivePlays,
  totalSounds,
  loadedSoundsCount,
} = useSoundboard();
const shiftHeld = ref(false);

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Shift') {
    shiftHeld.value = true;
  }
  if (e.key === 'Escape') {
    fadeOutAll();
    e.preventDefault();
    return;
  }
  if (e.code === 'Space' && e.shiftKey) {
    fadeOutAll();
    e.preventDefault();
    return;
  }
  if (e.metaKey || e.ctrlKey) return;
  const keyCode = e.code;
  const definition = KEY_CODE_TO_DEFINITION.get(keyCode);
  if (!definition?.soundUrl) return;
  e.preventDefault();
  if (e.shiftKey) {
    fadeOut(definition.letter);
  } else {
    play(definition.letter);
  }
}

function handleStop(letter: Letter) {
  if (letter === 'Space') {
    fadeOutAll();
  } else {
    fadeOut(letter);
  }
}

function handleKeyup(e: KeyboardEvent) {
  if (e.key === 'Shift') {
    shiftHeld.value = false;
  }
}

onMounted(() => {
  preload();
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('keyup', handleKeyup);
});
</script>

<template>
  <div class="min-h-screen bg-brown px-4 py-6">
    <h1 class="font-ranchers mb-4 text-2xl leading-none md:text-4xl md:mb-3">
      <span class="text-blue">Are</span
      ><span class="text-red text-[2em]">You</span>
      <br />
      <span
        class="text-green inline-block text-[0.7em]"
        style="position: relative; top: -0.4em"
        >My</span
      >
      <span class="text-yellow"> People?</span>
    </h1>

    <!-- Desktop: keyboard -->
    <div class="hidden justify-center md:flex">
      <Keyboard
        :loading="loading"
        :rows="QWERTY_ROWS"
        :shift-held="shiftHeld"
        :get-active-plays="getActivePlays"
        :loaded-sounds-count="loadedSoundsCount"
        :total-sounds="totalSounds"
        @play="play"
        @stop="handleStop"
      />
    </div>

    <!-- Mobile: grid of sound buttons -->
    <div class="md:hidden" :class="hasAnyActivePlays && 'pb-14'">
      <MobileSoundGrid
        :loading="loading"
        :shift-held="shiftHeld"
        :get-active-plays="getActivePlays"
        :loaded-sounds-count="loadedSoundsCount"
        :total-sounds="totalSounds"
        @play="play"
        @stop="handleStop"
      />
    </div>

    <!-- Mobile only: fixed "Stop all sounds" when any sound is playing -->
    <div
      v-if="hasAnyActivePlays"
      class="fixed bottom-0 left-0 right-0 z-10 flex h-14 items-center justify-center border-t border-key-shift bg-key-shift shadow-[0_-2px_8px_rgba(0,0,0,0.08)] md:hidden"
    >
      <button
        type="button"
        class="h-full w-full font-medium transition hover:bg-key-shift/90 active:bg-key-shift/80"
        style="color: #1a1a1a"
        aria-label="Stop all sounds"
        @click="fadeOutAll"
      >
        Stop all sounds
      </button>
    </div>
  </div>
</template>
