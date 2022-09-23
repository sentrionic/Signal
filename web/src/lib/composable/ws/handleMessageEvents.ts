import type { ChatResponse, MessageResponse } from '@/lib/api';
import type { Socket } from 'socket.io-client';
import { useQueryClient } from 'vue-query';
import { useCurrentRoute } from '../common/useCurrentRoute';
import { cKey } from '../query/useChatsQuery';

export function handleMessageEvents(socket: Socket) {
  const cache = useQueryClient();
  const { id } = useCurrentRoute();

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

  socket.on('newNotification', (chatId: string, message: MessageResponse) => {
    cache.setQueryData<ChatResponse[]>(cKey, (old) => {
      if (!old) return [];
      if (chatId === id.value) return [...old];
      return [
        ...old.map((c) =>
          c.id === chatId ? { ...c, lastMessage: message, hasNotification: true } : c
        ),
      ];
    });
  });
}
