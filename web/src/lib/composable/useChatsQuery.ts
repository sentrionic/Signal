import { useQuery } from 'vue-query';
import { getChats } from '../api/handler/chats';

export const cKey = 'chats';

export function useChatsQuery() {
  const { data } = useQuery(cKey, getChats);

  return {
    data,
  };
}
