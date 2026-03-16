<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  question: string;
  colorClass: string;
  textColorClass: string;
  asked: boolean;
}>();

const lines = computed(() => props.question.split('\n'));
</script>

<template>
  <div class="relative px-6 md:px-10 py-8 w-full">
    <div class="max-w-xl mx-auto">
      <p
        class="font-sans text-center text-xl md:text-3xl leading-tight"
        :class="textColorClass"
      >
        <span v-for="(line, index) in lines" :key="index">
          {{ line }}<br v-if="index < lines.length - 1" />
        </span>
      </p>
    </div>
  </div>
  <div
    v-if="asked"
    class="absolute right-4 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
  >
    already asked
  </div>
</template>
