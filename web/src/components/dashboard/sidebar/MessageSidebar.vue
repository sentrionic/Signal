<script setup lang="ts">
import { useChatsQuery } from '@/lib/composable/query/useChatsQuery';
import { PencilIcon, XMarkIcon } from '@heroicons/vue/24/solid';
import { onClickOutside } from '@vueuse/core';
import { ref } from 'vue';
import NewChatModal from '../../modals/NewChatModal.vue';
import ChatItem from '../../items/ChatItem.vue';
import { useMessageSocket } from '@/lib/composable/ws/useMessageSocket';

const { data } = useChatsQuery();
useMessageSocket();

const showModal = ref(false);
const wrapper = ref<HTMLDivElement>();

const toggleShowModal = () => (showModal.value = !showModal.value);

onClickOutside(wrapper, () => {
  if (!showModal.value) return;
  showModal.value = false;
});
</script>

<template>
  <div class="relative h-full">
    <div class="h-full overflow-y-auto container">
      <div v-if="data?.length === 0" class="justify-center flex mt-4 text-center">
        <span class="text-gray-500 dark:text-gray-400 font-semibold">
          You got no messages currently
        </span>
      </div>
      <ul v-else v-for="chat in data" :key="chat.id">
        <li>
          <ChatItem :chat="chat" />
        </li>
      </ul>
      <div ref="wrapper">
        <transition name="to-top">
          <NewChatModal v-if="showModal" />
        </transition>
        <button type="button" @click="toggleShowModal" class="fab">
          <XMarkIcon v-if="showModal" class="w-7 h-7" />
          <PencilIcon v-else class="w-7 h-7" />
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.to-top-enter-active,
.to-top-leave-to {
  opacity: 0;
  transform: translateY(0);
}

.to-top-leave,
.to-top-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.to-top-enter-active,
.to-top-leave-active {
  transition: all 250ms;
}
</style>
