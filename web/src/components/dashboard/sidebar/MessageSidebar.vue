<script setup lang="ts">
import type { ChatResponse, GroupResponse } from '@/lib/api';
import { useChatsQuery } from '@/lib/composable/useChatsQuery';
import { PencilIcon, XMarkIcon } from '@heroicons/vue/24/solid';
import { onClickOutside } from '@vueuse/core';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import NewChatModal from '../../modals/NewChatModal.vue';

const { chatList } = useChatsQuery();

const route = useRoute();
const id = ref<string>('');

watch(
  () => route.params.id,
  (newId) => (id.value = newId.toString())
);

const showModal = ref(false);
const wrapper = ref<HTMLDivElement>();

const toggleShowModal = () => (showModal.value = !showModal.value);

onClickOutside(wrapper, () => {
  if (!showModal.value) return;
  showModal.value = false;
});

const isChatResponse = (item: ChatResponse | GroupResponse): boolean => 'user' in item;
</script>

<template>
  <div class="relative h-full">
    <div class="h-full overflow-y-auto container">
      <div v-if="chatList.length === 0" class="justify-center flex mt-4 text-center">
        <span class="text-gray-500 dark:text-gray-400 font-semibold">
          You got no messages currently
        </span>
      </div>
      <ul v-else v-for="chat in chatList" :key="chat.id">
        <li>
          <router-link :to="{ name: 'dashboard', params: { id: chat.id } }">
            <div
              :class="
                chat.id === id ? 'bg-primary-600' : 'hover:bg-zinc-100 dark:hover:bg-hoverDark'
              "
              class="flex items-center justify-between rounded-md p-2.5 hover:cursor-pointer"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <img
                    class="w-12 h-12 rounded-full"
                    :src="isChatResponse(chat) ? (chat as ChatResponse).user.image : (chat as GroupResponse).image"
                    :alt="isChatResponse(chat) ? (chat as ChatResponse).user.username + 's image' : (chat as GroupResponse).name + 's icon'"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    :class="chat.id === id ? 'text-white' : 'text-gray-900'"
                    class="font-medium truncate dark:text-white"
                  >
                    {{
                      isChatResponse(chat)
                        ? (chat as ChatResponse).user.displayName
                        : (chat as GroupResponse).name
                    }}
                  </p>
                </div>
              </div>
            </div>
          </router-link>
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
