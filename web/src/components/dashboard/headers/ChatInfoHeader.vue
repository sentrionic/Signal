<script lang="ts" setup>
import { XMarkIcon } from '@heroicons/vue/24/outline';
import IconButton from '@/components/common/IconButton.vue';
import { useInfoStore } from '@/stores/infoStore';

const { toggleVisibility } = useInfoStore();

const handleClose = () => {
  toggleVisibility();
};
</script>

<template>
  <div class="info-header">
    <div class="flex items-center justify-between h-full mx-4">
      <IconButton description="Go Back" :handleClick="handleClose">
        <XMarkIcon class="w-6 h-6 dark:text-iconsDark" />
      </IconButton>
      <div class="relative w-full ml-4">
        <h1 class="text-xl font-bold dark:text-white">Profile</h1>
      </div>
    </div>
  </div>
</template>
