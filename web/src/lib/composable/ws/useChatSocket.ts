import type { ChatResponse, MessageResponse } from '@/lib/api';
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { onMounted, onUnmounted } from 'vue';
import { useQueryClient } from 'vue-query';
import { useSocket } from '../common/useSocket';
import { cKey } from '../query/useChatsQuery';
import { mKey } from '../query/useMessagesQuery';

// From react-query types.d.ts
interface InfiniteData<TData> {
  pages: TData[];
  pageParams: unknown[];
}

export function useChatSocket(chatId: string) {
  const cache = useQueryClient();
  const { addTyping, removeTyping, resetTyping } = useChatStore();
  const { user } = useUserStore();

  const socket = useSocket();
  resetTyping();

  onMounted(() => {
    socket.emit('joinChat', chatId);

    socket.on('newMessage', (newMessage: MessageResponse) => {
      // Update chat cache
      cache.setQueryData<InfiniteData<MessageResponse[]>>([mKey, chatId], (old) => {
        if (!old) return { pages: [], pageParams: [] };
        return {
          pages: old.pages.map((messages, i) => (i === 0 ? [newMessage, ...messages] : messages)),
          pageParams: [...old.pageParams],
        };
      });

      // Update last message of the current chat and move it to the top if necessary
      cache.setQueryData<ChatResponse[]>([cKey], (old) => {
        if (!old) return [];
        const chat = old.find((c) => c.id === chatId);
        if (!chat) return [...old];
        return [{ ...chat, lastMessage: newMessage }, ...old.filter((c) => c.id !== chatId)];
      });
    });

    socket.on('editMessage', (updatedMessage: MessageResponse) => {
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

    socket.on('deleteMessage', (messageId: string) => {
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

    socket.on('addToTyping', (name: string) => {
      if (user?.displayName !== name) addTyping(name);
    });

    socket.on('removeFromTyping', (name: string) => {
      if (user?.displayName !== name) removeTyping(name);
    });
  });

  onUnmounted(() => {
    socket.emit('leaveChat', chatId);
  });
}
