import { useUserStore } from '@/stores/userStore';
import { onMounted, onUnmounted } from 'vue';
import { useSocket } from '../common/useSocket';
import { handleFriendEvents } from './handleFriendEvents';
import { handleMessageEvents } from './handleMessageEvents';
import { handleRequestEvents } from './handleRequestEvents';

export function useUserSocket() {
  const { user } = useUserStore();

  const socket = useSocket();

  onMounted(() => {
    socket.emit('joinUser', user?.id);

    // Message Events
    handleMessageEvents(socket);

    // Request Events
    handleRequestEvents(socket);

    // Friend Events
    handleFriendEvents(socket);
  });

  onUnmounted(() => {
    socket.emit('leaveRoom', user?.id);
    socket.disconnect();
  });
}
