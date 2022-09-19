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
          pages: old.pages.map((messages, i) => (i === 0 ? [newMessage, ...messages] : messages)),
          pageParams: [...old.pageParams],
        };
      });

      // Update last message of the current chat
      cache.setQueryData<ChatResponse[]>([cKey], (old) => {
        if (!old) return [];
        return old.map((c) => (c.id === chatId ? { ...c, lastMessage: newMessage } : c));
      });
    });

    socket.on('edit_message', (updatedMessage: MessageResponse) => {
      // Update chat cache
      cache.setQueryData<InfiniteData<MessageResponse[]>>([mKey, chatId], (old) => {
        if (!old) return { pages: [], pageParams: [] };
        return {
          pages: old.pages.map((messages) =>
            messages.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          ),
          pageParams: [...old.pageParams],
        };
      });

      // Update last message of the current chat if necessary
      cache.setQueryData<ChatResponse[]>([cKey], (old) => {
        if (!old) return [];
        return old.map((c) =>
          c.id === chatId
            ? {
                ...c,
                lastMessage:
                  c.lastMessage?.id === updatedMessage.id ? updatedMessage : c.lastMessage,
              }
            : c
        );
      });
    });

    socket.on('delete_message', (messageId: string) => {
      // Update chat cache
      cache.setQueryData<InfiniteData<MessageResponse[]>>([mKey, chatId], (old) => {
        if (!old) return { pages: [], pageParams: [] };
        return {
          pages: old.pages.map((messages) => messages.filter((m) => m.id !== messageId)),
          pageParams: [...old.pageParams],
        };
      });

      // Update last message of the current chat if necessary
      cache.setQueryData<ChatResponse[]>([cKey], (old) => {
        if (!old) return [];
        return old.map((c) =>
          c.id === chatId
            ? {
                ...c,
                lastMessage: c.lastMessage?.id === messageId ? null : c.lastMessage,
              }
            : c
        );
      });
    });
  });

  onUnmounted(() => {
    socket.emit('leaveChat', chatId);
  });
}
