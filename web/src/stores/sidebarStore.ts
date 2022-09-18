import { SidebarMode } from '@/lib/models/sidebar-mode';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSidebarStore = defineStore('sidebar', () => {
  const mode = ref<SidebarMode>(SidebarMode.MESSAGES);
  const query = ref('');

  const setMode = (data: SidebarMode) => {
    mode.value = data;
  };

  const updateQuery = (data: string) => {
    query.value = data;
  };

  return {
    mode,
    setMode,
    query,
    updateQuery,
  };
});
