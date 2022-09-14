import { computed } from 'vue';
import { useQuery } from 'vue-query';
import { getAllChats } from '../api/handler/chats';

export const cKey = 'chats';

export function useChatsQuery() {
  const { data } = useQuery(cKey, getAllChats);

  const chatList = computed(() => {
    const groups = data.value?.groups ?? [];
    const chats = data.value?.chats ?? [];

    return [...groups, ...chats];
  });

  return {
    data,
    chatList,
  };
}
