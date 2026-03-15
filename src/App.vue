<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Keyboard from './components/Keyboard.vue';
import MobileSoundGrid from './components/MobileSoundGrid.vue';
import { useSoundboard } from './composables/useSoundboard';
import { KEY_CODE_TO_DEFINITION, QWERTY_ROWS, type Letter } from './lib/config';

const { loading, preload, play, fadeOut, fadeOutAll, getActivePlays, hasAnyActivePlays } =
  useSoundboard();
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
  <div class="min-h-screen bg-gray-50 px-4 py-6">
    <h1
      class="mb-6 text-center text-2xl font-semibold text-gray-800 md:text-3xl"
    >
      Are you my people?
    </h1>

    <!-- Desktop: keyboard -->
    <div class="hidden justify-center md:flex">
      <Keyboard
        :loading="loading"
        :rows="QWERTY_ROWS"
        :shift-held="shiftHeld"
        :get-active-plays="getActivePlays"
        @play="play"
        @stop="handleStop"
      />
    </div>

    <!-- Mobile: grid of sound buttons -->
    <div class="md:hidden">
      <MobileSoundGrid
        :loading="loading"
        :shift-held="shiftHeld"
        :get-active-plays="getActivePlays"
        :has-any-active-plays="hasAnyActivePlays"
        @play="play"
        @stop="handleStop"
      />
    </div>
  </div>
</template>
