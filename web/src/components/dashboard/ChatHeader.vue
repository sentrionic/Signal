<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useInfoStore } from '@/stores/infoStore';
import ChatUserHeader from '../chat/ChatUserHeader.vue';
import ChatGroupHeader from '../chat/ChatGroupHeader.vue';
import { useCurrentRoute } from '@/lib/composable/common/useCurrentRoute';

const { current } = useCurrentRoute();

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
        v-if="!current.group"
        :current="current"
        @toggleVisibility="toggleVisibility"
      />
      <ChatGroupHeader
        v-else
        :chatId="current.id"
        :current="current.group"
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
