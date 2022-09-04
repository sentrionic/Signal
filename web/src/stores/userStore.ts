import type { User } from '@/lib/models/models';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import Storage from '../lib/utils/storage';

export const userStorage = new Storage<User>('user');

export const isAuthorized = (): boolean => !!userStorage.get();

export const useUserStore = defineStore('user', () => {
  const user = ref(userStorage.get());
  const isAuthorized = computed(() => user.value !== null);

  const updateUser = (data?: User | null) => {
    if (data === undefined || data === null) {
      userStorage.remove();
      user.value = null;
    } else {
      userStorage.set(data);
      user.value = data;
    }
  };

  return {
    user,
    isAuthorized,
    updateUser,
  };
});
