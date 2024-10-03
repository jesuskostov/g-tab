<script setup>
const props = defineProps({
  transparent: Boolean,
  padding: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <!-- card -->
  <div
    class="bg-white rounded-[28px] overflow-hidden"
    :class="{
      'bg-opacity-70': transparent,
      'p-6': padding,
    }"
  >
    <slot />
  </div>
</template>
