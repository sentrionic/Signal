import type { UserResponse } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { onMounted, onUnmounted } from 'vue';
import { useQueryClient } from 'vue-query';
import { useSocket } from '../common/useSocket';
import { fKey } from '../query/useFriendsQuery';

export function useFriendSocket() {
  const cache = useQueryClient();
  const { user } = useUserStore();

  const socket = useSocket();

  onMounted(() => {
    socket.emit('joinUser', user?.id);

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
  });

  onUnmounted(() => {
    socket.emit('leaveRoom', user?.id);
    socket.disconnect();
  });
}
