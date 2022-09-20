import type { RequestResponse } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { onMounted, onUnmounted } from 'vue';
import { useQueryClient } from 'vue-query';
import { useSocket } from '../common/useSocket';
import { rKey } from '../query/useRequestsQuery';

export function useRequestSocket() {
  const cache = useQueryClient();
  const { user } = useUserStore();

  const socket = useSocket();

  onMounted(() => {
    socket.emit('joinUser', user?.id);

    socket.on('addRequest', (request: RequestResponse) => {
      // Update requests cache
      cache.setQueryData<RequestResponse[]>(rKey, (old) => {
        if (!old) return [];
        return [...old, request].sort((a, b) =>
          a.user.displayName.localeCompare(b.user.displayName)
        );
      });
    });
  });

  onUnmounted(() => {
    socket.emit('leaveRoom', user?.id);
    socket.disconnect();
  });
}
