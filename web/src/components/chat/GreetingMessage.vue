<script setup lang="ts">
import type { ChatResponse } from '@/lib/api';
import { computed } from 'vue';

const props = defineProps<{ chat: ChatResponse }>();

const getGreeting = computed(() => {
  if (props.chat.group) return `Welcome to ${props.chat.group.name}`;
  else if (props.chat.user) return `Welcome to your chat with ${props.chat.user.displayName}`;
  else return '';
});
</script>

<template>
  <div class="justify-center flex my-4 text-center">
    <span class="text-gray-500 dark:text-gray-400 font-semibold">{{ getGreeting }}</span>
  </div>
</template>
