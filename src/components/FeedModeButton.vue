<script setup lang="ts">
import type { FeedDisplayMode } from '../composables/useRealtimeFeed';

const props = defineProps<{
  currentMode: FeedDisplayMode;
  mode: FeedDisplayMode;
  label: string;
}>();

const emit = defineEmits<{
  select: [mode: FeedDisplayMode];
}>();

function onClick() {
  if (props.currentMode === props.mode) return;
  emit('select', props.mode);
}
</script>

<template>
  <button
    type="button"
    class="flex-1 rounded-lg aspect-square text-sm transition text-brown"
    :class="
      currentMode === mode
        ? 'bg-yellow font-bold opacity-40'
        : 'bg-white hover:bg-yellow/70 active:bg-yellow/60'
    "
    :disabled="currentMode === mode"
    @click="onClick"
  >
    {{ label }}
  </button>
</template>
