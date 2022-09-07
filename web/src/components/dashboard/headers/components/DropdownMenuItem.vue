<script lang="ts" setup>
defineProps<{ title: string; handleClick: () => void }>();
</script>

<template>
  <li>
    <div class="item" @click="handleClick()">
      <slot></slot>
      {{ title }}
    </div>
  </li>
</template>

<style>
.item {
  @apply flex items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white hover:cursor-pointer;
}
</style>
