import type { UserResponse } from '@/lib/api';
import type { Socket } from 'socket.io-client';
import { useQueryClient } from 'vue-query';
import { fKey } from '../query/useFriendsQuery';

export function handleFriendEvents(socket: Socket) {
  const cache = useQueryClient();

  socket.on('addFriend', (contact: UserResponse) => {
    // Update friends cache
    cache.setQueryData<UserResponse[]>(fKey, (old) => {
      if (!old) return [];
      return [...old, contact].sort((a, b) => a.displayName.localeCompare(b.displayName));
    });
  });

  socket.on('removeFriend', (friendId: string) => {
    cache.setQueryData<UserResponse[]>(fKey, (old) => {
      if (!old) return [];
      return [...old.filter((f) => f.id !== friendId)];
    });
  });
}
