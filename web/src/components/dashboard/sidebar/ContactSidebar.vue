<script setup lang="ts">
import { PlusIcon, UserMinusIcon } from '@heroicons/vue/24/outline';
import { computed, ref } from 'vue';
import AddFriendModal from '../../modals/AddFriendModal.vue';
import ContextMenu from '@/components/modals/ContextMenu.vue';
import type { ContextMenuItem, ContextMenuSelection } from '@/lib/models/context-menu';
import RemoveFriendModal from '../../modals/RemoveFriendModal.vue';
import { useFriendsQuery } from '@/lib/composable/useFriendsQuery';
import { useSidebarStore } from '@/stores/sidebarStore';
import { storeToRefs } from 'pinia';

const { data } = useFriendsQuery();
const store = useSidebarStore();
const { query } = storeToRefs(store);

const isAddFriendVisible = ref(false);
const isRemoveFriendVisible = ref(false);

const onToggleAddFriend = () => (isAddFriendVisible.value = !isAddFriendVisible.value);
const onToggleRemoveFriend = () => (isRemoveFriendVisible.value = !isRemoveFriendVisible.value);

const contextmenu = ref();

const options: ContextMenuItem[] = [
  { name: 'Remove Friend', icon: UserMinusIcon, isDestructive: true },
];

const handleClick = (event: MouseEvent, value: string) => {
  contextmenu.value.showMenu(event, value);
};

const optionClicked = (event: ContextMenuSelection) => {
  if (event.option.name === 'Remove Friend') onToggleRemoveFriend();
};

const filteredList = computed(() => {
  return data.value?.filter((e) =>
    e.displayName.toLocaleLowerCase().includes(query.value.toLocaleLowerCase())
  );
});
</script>

<template>
  <div class="relative h-full">
    <div class="h-full overflow-y-auto container">
      <div v-if="data?.length === 0" class="justify-center flex mt-4 text-center">
        <span class="text-gray-500 dark:text-gray-400 font-semibold"> No one here yet </span>
      </div>
      <ul
        v-else
        v-for="friend in filteredList"
        :key="friend.id"
        @contextmenu.prevent.stop="handleClick($event, friend.id)"
      >
        <li>
          <div
            class="flex items-center space-x-4 hover:bg-zinc-100 rounded-md p-2.5 hover:cursor-pointer"
          >
            <div class="flex-shrink-0">
              <img
                class="w-12 h-12 rounded-full"
                :src="friend.image"
                :alt="friend.username + 's image'"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate dark:text-white">
                {{ friend.displayName }}
              </p>
              <p class="text-gray-500 truncate dark:text-gray-400">{{ friend.bio }}</p>
            </div>
          </div>
        </li>
        <RemoveFriendModal
          v-if="isRemoveFriendVisible"
          :onClose="onToggleRemoveFriend"
          :user="friend"
        />
      </ul>
    </div>
    <ContextMenu
      elementId="myUniqueId"
      :options="options"
      ref="contextmenu"
      @option-clicked="optionClicked"
    />

    <button type="button" @click="onToggleAddFriend" class="fab">
      <PlusIcon class="w-7 h-7" />
    </button>
  </div>
  <AddFriendModal v-if="isAddFriendVisible" :onClose="onToggleAddFriend" />
</template>

<style>
.container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.container::-webkit-scrollbar {
  display: none;
}

.fab {
  @apply absolute bottom-2 right-2 text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-full p-3 text-center inline-flex items-center mr-2 dark:bg-primary-600 dark:hover:bg-primary-700;
}
</style>
