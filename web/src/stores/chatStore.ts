import type { MessageResponse } from '@/lib/api';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatStore = defineStore('chat', () => {
  const isEditing = ref<boolean>(false);
  const message = ref<MessageResponse | null>(null);
  const typing = ref<string[]>([]);

  const toggleEditing = () => {
    isEditing.value = !isEditing.value;
  };

  const setMessage = (value: MessageResponse | null) => {
    message.value = value;
  };

  const addTyping = (name: string) => {
    typing.value = [...typing.value, name];
  };

  const removeTyping = (name: string) => {
    typing.value = [...typing.value.filter((n) => n !== name)];
  };

  const resetTyping = () => {
    typing.value = [];
  };

  return {
    isEditing,
    toggleEditing,
    message,
    setMessage,
    addTyping,
    removeTyping,
    resetTyping,
    typing,
  };
});
