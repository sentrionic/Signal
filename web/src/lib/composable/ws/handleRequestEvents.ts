import type { RequestResponse } from '@/lib/api';
import type { Socket } from 'socket.io-client';
import { useQueryClient } from 'vue-query';
import { rKey } from '../query/useRequestsQuery';

export function handleRequestEvents(socket: Socket) {
  const cache = useQueryClient();

  socket.on('addRequest', (request: RequestResponse) => {
    // Update requests cache
    cache.setQueryData<RequestResponse[]>(rKey, (old) => {
      if (!old) return [];
      return [...old, request].sort((a, b) => a.user.displayName.localeCompare(b.user.displayName));
    });
  });
}
