<script setup lang="ts">
import { useCurrentRoute } from '@/lib/composable/common/useCurrentRoute';
import ChatUserInfo from '../chat/ChatUserInfo.vue';
import ChatGroupInfo from '../chat/ChatGroupInfo.vue';

const { current } = useCurrentRoute();
</script>

<template>
  <div class="info space-y-2">
    <ChatUserInfo v-if="current?.user" :current="current" />
    <ChatGroupInfo v-if="current?.group" :current="current.group" />
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
