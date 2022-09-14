<script setup lang="ts">
import type { ChatResponse } from '@/lib/api';
import { getLastSeen } from '@/lib/utils/dateUtils';
import { useClipboard } from '@vueuse/core';
import { computed } from 'vue';
import { AtSymbolIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{ current: ChatResponse }>();

const getSubtitle = computed(() => {
  return getLastSeen(props.current.user.lastOnline);
});

const { copy, copied } = useClipboard({ source: props.current.user.username });
</script>

<template>
  <div class="flex w-full justify-center mt-4">
    <img
      class="w-28 h-28 rounded-full"
      :src="current.user.image"
      :alt="current.user.displayName + '\'s image'"
    />
  </div>
  <div class="w-full justify-center flex relative">
    <h6 class="text-lg font-bold text-gray-600 dark:text-white">
      {{ current.user.displayName }}
    </h6>
  </div>
  <p
    class="text-sm font-semibold text-gray-500 truncate dark:text-gray-400 justify-center w-full flex"
  >
    {{ getSubtitle }}
  </p>
  <p class="text-gray-500 truncate dark:text-gray-400 justify-center w-full flex">
    {{ current.user.bio }}
  </p>
  <div
    @click="copy()"
    class="flex items-center space-x-4 hover:bg-zinc-100 hover:dark:bg-hoverDark rounded-md p-2.5 m-4 hover:cursor-pointer"
  >
    <div class="flex min-w-0">
      <AtSymbolIcon class="w-8 h-8 dark:text-white" />
    </div>
    <div class="relative">
      <p class="text-lg font-bold text-gray-600 dark:text-white">
        {{ current.user.username }}
      </p>
      <div
        v-if="copied"
        class="inline-block absolute z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700 bottom-8"
      >
        Copied!
        <div class="tooltip-arrow" data-popper-arrow></div>
      </div>
    </div>
  </div>
</template>
