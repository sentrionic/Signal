<script setup lang="ts">
import type { ChatResponse } from '@/lib/api';
import { getLastSeen } from '@/lib/utils/dateUtils';
import { computed } from 'vue';

const props = defineProps<{ current: ChatResponse }>();
const emits = defineEmits<{
  (event: 'toggleVisibility'): void;
}>();

const user = computed(() => props.current.user);

const getSubtitle = computed(() => {
  return getLastSeen(user.value?.lastOnline ?? '');
});
</script>

<template>
  <div v-if="!user"></div>
  <div
    v-else
    class="flex items-center space-x-4 h-full ml-4 hover:cursor-pointer"
    @click="() => emits('toggleVisibility')"
  >
    <div class="flex-shrink-0">
      <img class="w-10 h-10 rounded-full" :src="user.image" :alt="user.displayName + '\'s image'" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-md font-bold text-gray-900 truncate dark:text-white">
        {{ user.displayName }}
      </p>
      <p class="text-sm font-semibold text-gray-500 truncate dark:text-gray-400">
        {{ getSubtitle }}
      </p>
    </div>
  </div>
</template>
