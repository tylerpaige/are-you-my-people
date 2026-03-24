<script setup lang="ts">
import type { FeedDisplayMode } from '../composables/useRealtimeFeed';
import FeedModeButton from './FeedModeButton.vue';

defineProps<{
  mode: FeedDisplayMode;
}>();

const emit = defineEmits<{
  change: [mode: FeedDisplayMode];
}>();
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <FeedModeButton
      :current-mode="mode"
      mode="show"
      label="Show"
      @select="emit('change', $event)"
    />
    <FeedModeButton
      :current-mode="mode"
      mode="commercials"
      label="Commercials"
      @select="emit('change', $event)"
    />
    <FeedModeButton
      :current-mode="mode"
      mode="credits"
      label="Credits"
      @select="emit('change', $event)"
    />
  </div>
</template>
