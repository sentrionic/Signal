<script setup lang="ts">
import { useCurrentRoute } from '@/lib/composable/useCurrentRoute';
import ChatWindow from '../chat/ChatWindow.vue';

const { current } = useCurrentRoute();
</script>

<template>
  <div class="main overflow-auto scrollbar-css flex flex-col-reverse">
    <ChatWindow v-if="current" :chat="current" :key="current.id" />
  </div>
</template>

<style>
.main {
  grid-row-start: main;
  grid-column-start: main;
  grid-row-end: main;
  grid-column-end: main;
  @apply border-l border-t border-r border-borderLight dark:border-borderDark bg-slate-100 dark:bg-black;
}

.scrollbar-css {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-css::-webkit-scrollbar {
  display: none;
}
</style>
