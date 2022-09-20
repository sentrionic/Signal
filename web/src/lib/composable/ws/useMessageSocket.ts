import type { ChatResponse } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { onMounted, onUnmounted } from 'vue';
import { useQueryClient } from 'vue-query';
import { useSocket } from '../common/useSocket';
import { cKey } from '../query/useChatsQuery';

export function useMessageSocket() {
  const cache = useQueryClient();
  const { user } = useUserStore();

  const socket = useSocket();

  onMounted(() => {
    socket.emit('joinUser', user?.id);

    socket.on('sendChat', (chat: ChatResponse) => {
      console.log('HERE');
      // Update requests cache
      cache.setQueryData<ChatResponse[]>(cKey, (old) => {
        if (!old) return [chat];
        return [chat, ...old];
      });
    });
  });

  onUnmounted(() => {
    socket.emit('leaveRoom', user?.id);
    socket.disconnect();
  });
}
