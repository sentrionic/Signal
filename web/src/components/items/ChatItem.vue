<script setup lang="ts">
import type { ChatResponse } from '@/lib/api';
import { useCurrentRoute } from '@/lib/composable/common/useCurrentRoute';

const { id } = useCurrentRoute();
defineProps<{ chat: ChatResponse }>();
</script>

<template>
  <router-link :to="{ name: 'dashboard', params: { id: chat.id } }">
    <div
      :class="chat.id === id ? 'bg-primary-600' : 'hover:bg-zinc-100 dark:hover:bg-hoverDark'"
      class="flex items-center truncate justify-between rounded-md p-2.5 hover:cursor-pointer"
    >
      <div class="flex items-center space-x-4">
        <div class="flex-shrink-0">
          <img
            class="w-12 h-12 rounded-full"
            :src="chat.type === 'DIRECT CHAT' ? chat.user?.image : chat.group?.image"
            :alt="
              chat.type === 'DIRECT CHAT'
                ? chat.user?.username + 's image'
                : chat.group?.name + 's icon'
            "
          />
        </div>
        <div class="flex-1">
          <p
            :class="chat.id === id ? 'text-white' : 'text-gray-900'"
            class="font-medium truncate dark:text-white w-52 lg:w-80"
          >
            {{ chat.type === 'DIRECT CHAT' ? chat.user?.displayName : chat.group?.name }}
          </p>
          <p
            :class="chat.id === id ? 'text-gray-300' : 'text-gray-500'"
            class="text-gray-500 truncate dark:text-gray-400 w-52 lg:w-80"
          >
            {{ chat.lastMessage }}
          </p>
        </div>
      </div>
    </div>
  </router-link>
</template>
