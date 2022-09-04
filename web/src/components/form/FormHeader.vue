<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <h1
    class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
  >
    {{ title }}
  </h1>
</template>
