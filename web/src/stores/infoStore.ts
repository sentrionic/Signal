import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useInfoStore = defineStore('info', () => {
  const isVisible = ref<boolean>(false);

  const toggleVisibility = () => {
    isVisible.value = !isVisible.value;
  };

  return {
    isVisible,
    toggleVisibility,
  };
});
