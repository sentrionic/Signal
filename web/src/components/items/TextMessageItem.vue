<script setup lang="ts">
import type { ChatResponse, MessageResponse } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';
import { formatSentAt } from '@/lib/utils/dateUtils';
import ContextMenu from '../modals/ContextMenu.vue';
import type { ContextMenuItem, ContextMenuSelection } from '@/lib/models/context-menu';
import { DocumentDuplicateIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { useClipboard } from '@vueuse/core';
import DeleteMessageModal from '../modals/DeleteMessageModal.vue';
import { useChatStore } from '@/stores/chatStore';
import { useCurrentRoute } from '@/lib/composable/common/useCurrentRoute';
import { useQueryClient } from 'vue-query';
import { cKey } from '@/lib/composable/query/useChatsQuery';

const { user } = useUserStore();
const { setMessage, toggleEditing } = useChatStore();
const props = defineProps<{ message: MessageResponse }>();

const isAuthor = computed(() => {
  return props.message.user.id === user?.id;
});

const contextmenu = ref();

const contextOptions = computed(() => {
  const options: ContextMenuItem[] = [];

  if (isAuthor.value) options.push({ name: 'Edit', icon: PencilIcon });
  options.push({ name: 'Copy', icon: DocumentDuplicateIcon });
  if (isAuthor.value) options.push({ name: 'Delete', icon: TrashIcon, isDestructive: true });

  return options;
});

const handleContextMenu = (event: MouseEvent, value: string) => {
  contextmenu.value.showMenu(event, value);
};

const optionClicked = (event: ContextMenuSelection) => {
  switch (event.option.name) {
    case 'Edit': {
      setMessage(props.message);
      toggleEditing();
      break;
    }
    case 'Copy': {
      useClipboard({ source: props.message.text ?? '' }).copy();
      break;
    }
    case 'Delete': {
      onToggleDeleteMessage();
      break;
    }
  }
};

const isDeleteModalVisible = ref(false);

const onToggleDeleteMessage = () => (isDeleteModalVisible.value = !isDeleteModalVisible.value);

onMounted(() => {
  const { id } = useCurrentRoute();
  const cache = useQueryClient();
  cache.setQueryData<ChatResponse[]>(cKey, (old) => {
    if (!old) return [];
    return [...old.map((c) => (c.id === id.value ? { ...c, hasNotification: false } : c))];
  });
});
</script>

<template>
  <div
    :class="
      isAuthor
        ? 'bg-slate-500 dark:bg-slate-800 text-white'
        : 'bg-white dark:bg-bgDark dark:text-white'
    "
    class="py-2 px-4 m-2 rounded-2xl shadow-sm w-fit max-w-lg"
    @contextmenu.prevent.stop="handleContextMenu($event, message.id)"
  >
    <p v-if="!isAuthor" class="text-sm font-semibold">
      {{ message.user.displayName }}
    </p>
    <p :class="isAuthor ? 'text-right' : ''">
      {{ message.text }}
    </p>
    <p class="text-right text-xs text-grey-dark mt-1">{{ formatSentAt(message.sentAt) }}</p>
    <p v-if="message.sentAt !== message.updatedAt" class="text-xs text-grey-dark">Edited</p>
  </div>
  <ContextMenu
    :elementId="'messageMenu-' + message.id"
    :options="contextOptions"
    ref="contextmenu"
    @option-clicked="optionClicked"
  />
  <DeleteMessageModal
    v-if="isDeleteModalVisible"
    :onClose="onToggleDeleteMessage"
    :message="message"
  />
</template>
