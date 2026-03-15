<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import Keyboard from './components/Keyboard.vue';
import MobileSoundGrid from './components/MobileSoundGrid.vue';
import { useSoundboard } from './composables/useSoundboard';
import { LETTERS, KEY_CODE_TO_DEFINITION, QWERTY_ROWS } from './lib/config';

const { loading, preload, play, getActivePlays } = useSoundboard();

function handleKeydown(e: KeyboardEvent) {
  const keyCode = e.code;
  const definition = KEY_CODE_TO_DEFINITION.get(keyCode);
  console.log('handleKeydown', keyCode, definition);
  if (definition?.soundUrl) {
    console.log('playing', keyCode);
    play(definition.keyCode);
    e.preventDefault();
  }
}

onMounted(() => {
  preload();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-6">
    <h1 class="mb-6 text-center text-2xl font-semibold text-gray-800 md:text-3xl">
      Soundboard
    </h1>

    <!-- Desktop: keyboard -->
    <div class="hidden justify-center md:flex">
      <Keyboard :loading="loading" :rows="QWERTY_ROWS" :get-active-plays="getActivePlays" @play="play" />
    </div>

    <!-- Mobile: grid of sound buttons -->
    <div class="md:hidden">
      <MobileSoundGrid
        :loading="loading"
        :letters="LETTERS"
        :get-active-plays="getActivePlays"
        @play="play"
      />
    </div>
  </div>
</template>
