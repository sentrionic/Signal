<script setup lang="ts">
import type { ChatResponse, MessageResponse } from '@/lib/api';
import { useMessagesQuery } from '@/lib/composable/useMessagesQuery';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';
import { checkNewDay, formatDivider } from '@/lib/utils/dateUtils';
import TextMessageItem from '../items/TextMessageItem.vue';
import ImageMessageItem from '../items/ImageMessageItem.vue';
import InfiniteScroll from './InfiniteScroll.vue';
import SpinnerIcon from '../icons/SpinnerIcon.vue';
import GreetingMessage from './GreetingMessage.vue';

const props = defineProps<{ chat: ChatResponse }>();

const { data, hasMore, fetchNextPage, isLoading } = useMessagesQuery(props.chat.id);
const { user } = useUserStore();

const messages = computed(() => {
  return data.value ? data.value?.pages.map((p) => p.map((mr) => mr)).flat() : [];
});

const isAuthor = (message: MessageResponse): boolean => {
  return message.user.id === user?.id;
};

const isNewDay = (message: MessageResponse, index: number): boolean => {
  return checkNewDay(
    message.sentAt,
    messages.value[Math.min(index + 1, messages.value.length - 1)].sentAt
  );
};
</script>

<template>
  <div v-if="isLoading"></div>
  <div v-else-if="messages?.length === 0" class="justify-center flex my-4 text-center">
    <GreetingMessage :chat="chat" />
  </div>
  <div v-else class="p-4 overflow-y-auto flex flex-col-reverse scrollbar-css" ref="scrollComponent">
    <ul v-for="(message, index) in messages" :key="message.id" class="pb-2 w-full">
      <div v-if="isNewDay(message, index)" class="flex justify-center my-4">
        <p class="text-center bg-black/40 p-2 rounded-xl text-white w-fit">
          {{ formatDivider(message.sentAt) }}
        </p>
      </div>
      <li class="w-full flex" :class="isAuthor(message) ? 'justify-end' : ''">
        <TextMessageItem v-if="message.type === 'TEXT'" :message="message" />
        <ImageMessageItem v-else-if="message.type === 'IMAGE'" :message="message" />
      </li>
    </ul>
    <InfiniteScroll
      :load="
        ({ loaded, noMore }) => {
          if (hasMore) {
            fetchNextPage();
            loaded();
          } else {
            noMore();
          }
        }
      "
      position="top"
    >
      <template #loading>
        <div class="flex justify-center my-4" role="status">
          <SpinnerIcon />
          <span class="sr-only">Loading...</span>
        </div>
      </template>
      <template #no-more>
        <GreetingMessage :chat="chat" />
      </template>
    </InfiniteScroll>
  </div>
</template>

<style>
.scrollbar-css {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-css::-webkit-scrollbar {
  display: none;
}
</style>
