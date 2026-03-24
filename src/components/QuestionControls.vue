<script setup lang="ts">
const emit = defineEmits<{
  skip: [];
  asked: [];
}>();
</script>

<template>
  <div
    class="relative flex items-center justify-between pb-4 pt-6"
    style="touch-action: manipulation"
  >
    <button
      type="button"
      class="font-ranchers text-3xl uppercase md:text-4xl leading-none px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform duration-150 select-none"
      style="touch-action: manipulation"
      aria-label="Mark asked and go to next question"
      @click="emit('asked')"
    >
      Asked
    </button>

    <div class="flex-1 flex justify-center">
      <slot name="logo" />
    </div>

    <button
      type="button"
      class="font-ranchers text-3xl uppercase md:text-4xl leading-none px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform duration-150 select-none"
      style="touch-action: manipulation"
      aria-label="Skip question"
      @click="emit('skip')"
    >
      Skip
    </button>
  </div>
</template>
