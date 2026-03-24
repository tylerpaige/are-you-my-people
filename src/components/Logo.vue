<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{ size?: 'small' | 'medium' | 'large'; class?: string }>(),
  { size: 'medium', class: '' }
);

const SIZE_CLASSES: Record<'small' | 'medium' | 'large', string> = {
  small: 'w-full max-w-[6rem] md:max-w-[8rem]',
  medium: 'w-full max-w-[8rem] md:max-w-[10rem]',
  large: 'w-full max-w-md md:max-w-md',
};

const widthClass = computed(() => SIZE_CLASSES[props.size]);
</script>

<template>
  <h1 :class="['mb-4 md:mb-3 block select-none', widthClass, props.class]">
    <img src="/logo.png" alt="Are You My People?" class="w-full" />
    <span class="sr-only">Are You My People?</span>
  </h1>
</template>
