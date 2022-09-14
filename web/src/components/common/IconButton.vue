<script setup lang="ts">
defineProps<{ description: string; handleClick: () => void }>();
</script>

<template>
  <button type="button" @click="handleClick()" class="btn">
    <slot></slot>
    <span class="sr-only">{{ description }}</span>
  </button>
</template>

<style>
.btn {
  @apply hover:bg-zinc-100 dark:hover:bg-hoverDark focus:outline-none font-medium rounded-full p-2 text-center inline-flex items-center;
  color: #707579;
}
</style>
