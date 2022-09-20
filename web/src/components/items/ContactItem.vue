<script setup lang="ts">
import type { ChatResponse, UserResponse } from '@/lib/api';
import { getOrCreateChat } from '@/lib/api/handler/chats';
import { useChatsQuery, cKey } from '@/lib/composable/query/useChatsQuery';
import { SidebarMode } from '@/lib/models/sidebar-mode';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useQueryClient } from 'vue-query';
import { useRouter } from 'vue-router';

const props = defineProps<{ friend: UserResponse }>();
const { data: chatData } = useChatsQuery();
const { setMode } = useSidebarStore();
const router = useRouter();
const cache = useQueryClient();

const handleClick = async () => {
  const contact = chatData.value?.find((e) => e.user?.id === props.friend.id);

  if (contact) {
    router.push({ name: 'dashboard', params: { id: contact.id } });
    setMode(SidebarMode.MESSAGES);
  } else {
    try {
      const response = await getOrCreateChat(props.friend.id);
      cache.setQueryData<ChatResponse[]>(cKey, (old) => {
        if (!old) return [];
        return [response, ...old];
      });
      router.push({ name: 'dashboard', params: { id: response.id } });
      setMode(SidebarMode.MESSAGES);
    } catch (err) {
      console.log(err);
    }
  }
};
</script>

<template>
  <div
    @click="() => handleClick()"
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
