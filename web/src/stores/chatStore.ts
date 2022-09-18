import type { MessageResponse } from '@/lib/api';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatStore = defineStore('chat', () => {
  const isEditing = ref<boolean>(false);
  const message = ref<MessageResponse | null>(null);

  const toggleEditing = () => {
    isEditing.value = !isEditing.value;
  };

  const setMessage = (value: MessageResponse | null) => {
    message.value = value;
  };

  return {
    isEditing,
    toggleEditing,
    message,
    setMessage,
  };
});
