<script setup lang="ts">
import type { UserResponse } from '@/lib/api';

defineProps<{ friend: UserResponse }>();
</script>

<template>
  <div
    class="flex items-center space-x-4 hover:bg-zinc-100 dark:hover:bg-hoverDark rounded-md p-2.5 hover:cursor-pointer"
  >
    <div class="flex-shrink-0">
      <img class="w-12 h-12 rounded-full" :src="friend.image" :alt="friend.username + 's image'" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-medium text-gray-900 truncate dark:text-white">
        {{ friend.displayName }}
      </p>
      <p class="text-gray-500 truncate dark:text-gray-400">{{ friend.bio }}</p>
    </div>
  </div>
</template>
