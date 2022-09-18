<script lang="ts" setup>
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import { SidebarMode } from '../../../lib/models/sidebar-mode';
import { useSidebarStore } from '../../../stores/sidebarStore';
import IconButton from '@/components/common/IconButton.vue';

const { setMode } = useSidebarStore();

const handdleBack = () => {
  setMode(SidebarMode.MESSAGES);
};
</script>

<template>
  <div class="flex items-center justify-between h-full mx-4">
    <IconButton description="Go Back" :handleClick="handdleBack">
      <ArrowLeftIcon class="w-6 h-6 dark:text-iconsDark" />
    </IconButton>
    <div class="relative w-full ml-4">
      <h1 class="text-xl font-bold dark:text-white">New Group</h1>
    </div>
  </div>
</template>
