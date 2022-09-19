import type { ChatResponse, MessageResponse } from '@/lib/api';
import { onMounted, onUnmounted } from 'vue';
import { useQueryClient } from 'vue-query';
import { getSocket } from '../common/useSocket';
import { cKey } from '../query/useChatsQuery';
import { mKey } from '../query/useMessagesQuery';

// From react-query types.d.ts
interface InfiniteData<TData> {
  pages: TData[];
  pageParams: unknown[];
}

export function useChatSocket(chatId: string) {
  const cache = useQueryClient();

  const socket = getSocket();

  onMounted(() => {
    socket.emit('joinChat', chatId);

    socket.on('new_message', (newMessage: MessageResponse) => {
      // Update chat cache
      cache.setQueryData<InfiniteData<MessageResponse[]>>([mKey, chatId], (old) => {
        if (!old) return { pages: [], pageParams: [] };
        return {
          pages:
            old.pages.map((v: MessageResponse[], i: number) =>
              i === 0 ? [newMessage, ...v] : v
            ) || [],
          pageParams: [...old.pageParams],
        };
      });

      // Update last message of the current chat
      cache.setQueryData<ChatResponse[]>([cKey], (old) => {
        if (!old) return [];
        return old.map((c) =>
          c.id === chatId ? { ...c, lastMessage: formatMessage(newMessage) } : c
        );
      });
    });
  });

  onUnmounted(() => {
    socket.emit('leaveChat', chatId);
  });

  const formatMessage = (message: MessageResponse): string | null => {
    if (!message) return null;
    switch (message.type) {
      case 'TEXT':
        return message.text ?? null;
      case 'IMAGE':
        return message.attachment?.filename ?? 'Sent a file';
      default:
        return null;
    }
  };
}
