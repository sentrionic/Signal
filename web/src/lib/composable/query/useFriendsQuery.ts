import { getFriends } from '@/lib/api/handler/friends';
import { useQuery } from 'vue-query';

export const fKey = 'friends';

export function useFriendsQuery() {
  return useQuery(fKey, getFriends);
}
