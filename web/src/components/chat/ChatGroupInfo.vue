<script setup lang="ts">
import type { GroupResponse } from '@/lib/api';
import { computed } from 'vue';

const props = defineProps<{ current: GroupResponse }>();

const getSubtitle = computed(() => {
  return `${
    props.current.memberCount === 1
      ? props.current.memberCount + ' member'
      : props.current.memberCount + ' members'
  } `;
});
</script>

<template>
  <div class="flex w-full justify-center mt-4">
    <img
      class="w-28 h-28 rounded-full"
      :src="current.image"
      :alt="'Image for group ' + current.name"
    />
  </div>
  <div class="w-full justify-center flex relative">
    <h6 class="text-lg font-bold text-gray-600 dark:text-white">
      {{ current.name }}
    </h6>
  </div>
  <p
    class="text-sm font-semibold text-gray-500 truncate dark:text-gray-400 justify-center w-full flex"
  >
    {{ getSubtitle }}
  </p>
</template>
