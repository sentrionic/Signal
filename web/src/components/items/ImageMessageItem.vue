<script setup lang="ts">
import type { MessageResponse } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { computed, ref } from 'vue';
import ContextMenu from '../modals/ContextMenu.vue';
import type { ContextMenuItem, ContextMenuSelection } from '@/lib/models/context-menu';
import { LinkIcon, TrashIcon } from '@heroicons/vue/24/outline';
import DeleteMessageModal from '../modals/DeleteMessageModal.vue';

const { user } = useUserStore();
const props = defineProps<{ message: MessageResponse }>();

const isAuthor = computed(() => {
  return props.message.user.id === user?.id;
});

const contextmenu = ref();

const contextOptions = computed(() => {
  const options: ContextMenuItem[] = [{ name: 'Open URL', icon: LinkIcon }];
  if (isAuthor.value) options.push({ name: 'Delete', icon: TrashIcon, isDestructive: true });

  return options;
});

const handleContextMenu = (event: MouseEvent, value: string) => {
  contextmenu.value.showMenu(event, value);
};

const optionClicked = (event: ContextMenuSelection) => {
  if (event.option.name === 'Open URL') {
    window.open(props.message.attachment?.url, '_blank')?.focus();
  }

  if (event.option.name === 'Delete') {
    onToggleDeleteMessage();
  }
};

const isDeleteModalVisible = ref(false);

const onToggleDeleteMessage = () => (isDeleteModalVisible.value = !isDeleteModalVisible.value);
</script>

<template>
  <div
    class="py-2 px-4 m-2 rounded-2xl w-fit"
    @contextmenu.prevent.stop="handleContextMenu($event, message.id)"
  >
    <img
      class="max-w-lg h-auto rounded-lg shadow-sm"
      :src="message.attachment?.url"
      alt="Message Attachment"
    />
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
