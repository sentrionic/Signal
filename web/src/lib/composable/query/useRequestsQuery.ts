import { getRequests } from '@/lib/api/handler/requests';
import { useQuery } from 'vue-query';

export const rKey = 'requests';

export function useRequestsQuery() {
  return useQuery(rKey, getRequests);
}
