<script setup lang="ts">
import { computed, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import type { ChatResponse, GroupResponse } from '@/lib/api';
import { useInfoStore } from '@/stores/infoStore';
import ChatUserHeader from '../chat/ChatUserHeader.vue';
import ChatGroupHeader from '../chat/ChatGroupHeader.vue';
import { useCurrentRoute } from '@/lib/composable/useCurrentRoute';

const { current } = useCurrentRoute();

const isGroup = computed(() => {
  if (!current.value) return false;
  return !('user' in current.value);
});

const showMenu = ref(false);

const onHide = () => (showMenu.value = false);
const onToggle = () => (showMenu.value = !showMenu.value);

const wrapper = ref<HTMLDivElement>();

onClickOutside(wrapper, () => {
  if (!showMenu.value) return;
  showMenu.value = false;
});

const { toggleVisibility } = useInfoStore();
</script>

<template>
  <div class="header">
    <div v-if="current" class="flex items-center justify-between space-x-4 h-full" ref="wrapper">
      <ChatUserHeader
        v-if="!isGroup"
        :current="(current as ChatResponse)"
        @toggleVisibility="toggleVisibility"
      />
      <ChatGroupHeader
        v-else
        :current="(current as GroupResponse)"
        :showMenu="showMenu"
        @toggleVisibility="toggleVisibility"
        @onHide="onHide"
        @onToggle="onToggle"
      />
    </div>
  </div>
</template>

<style>
.header {
  grid-row-start: header;
  grid-column-start: header;
  grid-row-end: header;
  grid-column-end: header;
  @apply shadow-sm z-10 border-x border-borderLight dark:border-borderDark;
}
</style>
