<script setup lang="ts">
import type { GroupResponse } from '@/lib/api';
import { computed, ref } from 'vue';
import ChatDropdown from '../chat/ChatDropdown.vue';
import AddMemberModal from '../modals/AddMemberModal.vue';
import LeaveGroupModal from '../modals/LeaveGroupModal.vue';
import IconButton from '../common/IconButton.vue';
import { EllipsisVerticalIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{ chatId: string; current: GroupResponse; showMenu: boolean }>();
const emits = defineEmits<{
  (event: 'toggleVisibility'): void;
  (event: 'onHide'): void;
  (event: 'onToggle'): void;
}>();

const getSubtitle = computed(() => {
  return `${
    props.current.memberCount === 1
      ? props.current.memberCount + ' member'
      : props.current.memberCount + ' members'
  } `;
});

const showAddModal = ref(false);
const toggleAddModal = () => (showAddModal.value = !showAddModal.value);

const showLeaveModal = ref(false);
const toggleLeaveModal = () => (showLeaveModal.value = !showLeaveModal.value);

const handleAdd = () => {
  toggleAddModal();
  emits('onHide');
};

const handleLeave = () => {
  toggleLeaveModal();
  emits('onHide');
};
</script>

<template>
  <div
    class="flex items-center space-x-4 h-full ml-4 hover:cursor-pointer"
    @click="() => emits('toggleVisibility')"
  >
    <div class="flex-shrink-0">
      <img
        class="w-10 h-10 rounded-full"
        :src="current.image"
        :alt="'Image for group ' + current.name"
      />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-md font-bold text-gray-900 truncate dark:text-white">
        {{ current.name }}
      </p>
      <p class="text-sm font-semibold text-gray-500 truncate dark:text-gray-400">
        {{ getSubtitle }}
      </p>
    </div>
  </div>
  <div class="relative">
    <IconButton class="mx-4" description="Open Menu" :handleClick="() => emits('onToggle')">
      <EllipsisVerticalIcon class="w-6 h-6 text-black dark:text-white" />
    </IconButton>
    <transition name="to-bottom">
      <ChatDropdown
        v-if="showMenu"
        :onHide="() => emits('onHide')"
        class="absolute top-6 right-6"
        @handleAdd="handleAdd"
        @handleLeave="handleLeave"
      />
    </transition>
    <AddMemberModal v-if="showAddModal" :chatId="chatId" :onClose="() => toggleAddModal()" />
    <LeaveGroupModal
      v-if="showLeaveModal"
      :chatId="chatId"
      :group="current"
      :onClose="() => toggleLeaveModal()"
    />
  </div>
</template>
