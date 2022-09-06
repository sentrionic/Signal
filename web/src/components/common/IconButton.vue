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
  @apply hover:bg-zinc-100 focus:outline-none font-medium rounded-full p-2 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800;
  color: #707579;
}
</style>
