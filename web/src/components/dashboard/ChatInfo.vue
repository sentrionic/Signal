<script setup lang="ts">
import { computed } from 'vue';
import { useCurrentRoute } from '@/lib/composable/useCurrentRoute';
import ChatUserInfo from '../chat/ChatUserInfo.vue';
import type { ChatResponse, GroupResponse } from '@/lib/api';
import ChatGroupInfo from '../chat/ChatGroupInfo.vue';

const { current } = useCurrentRoute();

const isGroup = computed(() => {
  if (!current.value) return false;
  return !('user' in current.value);
});
</script>

<template>
  <div class="info space-y-2">
    <ChatUserInfo v-if="!isGroup" :current="(current as ChatResponse)" />
    <ChatGroupInfo v-else :current="(current as GroupResponse)" />
  </div>
</template>

<style>
.info {
  grid-row-start: info;
  grid-column-start: info;
  grid-row-end: info;
  grid-column-end: info;
  @apply border-l border-borderLight dark:border-borderDark;
}
</style>
