<script setup lang="ts">
import { RequestType, type RequestResponse } from '@/lib/api';
import { acceptRequest, removeRequest } from '@/lib/api/handler/requests';
import { rKey } from '@/lib/composable/useRequestsQuery';
import { useQueryClient } from 'vue-query';
defineProps<{ request: RequestResponse }>();

const cache = useQueryClient();

const getType = (type: RequestType): string => {
  return type === RequestType.INCOMING ? 'Incoming' : 'Outgoing';
};

const handleAccept = async (id: string) => {
  try {
    await acceptRequest(id);
    cache.setQueryData<RequestResponse[]>(rKey, (old) => [
      ...(old?.filter((r) => r.user.id !== id) || []),
    ]);
  } catch (err) {
    console.log(err);
  }
};

const handleRemove = async (id: string) => {
  try {
    await removeRequest(id);
    cache.setQueryData<RequestResponse[]>(rKey, (old) => [
      ...(old?.filter((r) => r.user.id !== id) || []),
    ]);
  } catch (err) {
    console.log(err);
  }
};
</script>

<template>
  <div class="flex items-center justify-between hover:bg-zinc-100 rounded-md p-2.5">
    <div class="flex items-center space-x-4">
      <div class="flex-shrink-0">
        <img
          class="w-12 h-12 rounded-full"
          :src="request.user.image"
          :alt="request.user.username + 's image'"
        />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-medium text-gray-900 truncate dark:text-white">
          {{ request.user.displayName }}
        </p>
        <p class="text-gray-500 truncate dark:text-gray-400">{{ getType(request.type) }}</p>
      </div>
    </div>
    <div class="flex items-center space-x-4">
      <IconButton
        v-if="request.type === RequestType.INCOMING"
        description="Accept"
        :handleClick="() => handleAccept(request.user.id)"
      >
        <CheckIcon class="text-green-800 w-6 h-6" />
      </IconButton>
      <IconButton description="Decline" :handleClick="() => handleRemove(request.user.id)">
        <XMarkIcon class="text-red-800 w-6 h-6" />
      </IconButton>
    </div>
  </div>
</template>
