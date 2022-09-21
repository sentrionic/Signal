import type { ChatResponse } from '@/lib/api';
import type { Socket } from 'socket.io-client';
import { useQueryClient } from 'vue-query';
import { cKey } from '../query/useChatsQuery';

export function handleMessageEvents(socket: Socket) {
  const cache = useQueryClient();

  socket.on('sendChat', (chat: ChatResponse) => {
    // Update requests cache
    cache.setQueryData<ChatResponse[]>(cKey, (old) => {
      if (!old) return [chat];
      return [chat, ...old];
    });
  });

  socket.on('updateLastSeen', (friendId: string, lastSeen: string) => {
    cache.setQueryData<ChatResponse[]>(cKey, (old) => {
      if (!old) return [];
      return [...old.map((c) => (c.user?.id === friendId ? { ...c, lastSeen } : c))];
    });
  });
}
