<script setup lang="ts">
import { RequestType, type Request } from '../../../lib/api/models';
import IconButton from '../../common/IconButton.vue';
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { acceptRequest, removeRequest } from '@/lib/api/handler/requests';
import { useQueryClient } from 'vue-query';
import { rKey, useRequestsQuery } from '@/lib/composable/useRequestsQuery';
import { computed } from 'vue';
import { useSidebarStore } from '@/stores/sidebarStore';
import { storeToRefs } from 'pinia';

const { data } = useRequestsQuery();
const store = useSidebarStore();
const { query } = storeToRefs(store);
const cache = useQueryClient();

const getType = (type: RequestType): string => {
  return type === RequestType.INCOMING ? 'Incoming' : 'Outgoing';
};

const handleAccept = async (id: string) => {
  try {
    await acceptRequest(id);
    cache.setQueryData<Request[]>(rKey, (old) => [...(old?.filter((r) => r.user.id !== id) || [])]);
  } catch (err) {
    console.log(err);
  }
};

const handleRemove = async (id: string) => {
  try {
    await removeRequest(id);
    cache.setQueryData<Request[]>(rKey, (old) => [...(old?.filter((r) => r.user.id !== id) || [])]);
  } catch (err) {
    console.log(err);
  }
};

const filteredList = computed(() => {
  return data.value?.filter((e) =>
    e.user.displayName.toLocaleLowerCase().includes(query.value.toLocaleLowerCase())
  );
});
</script>

<template>
  <div class="h-full overflow-y-auto container">
    <div v-if="data?.length === 0" class="justify-center flex mt-4 text-center">
      <span class="text-gray-500 dark:text-gray-400 font-semibold">
        You got no requests currently
      </span>
    </div>

    <ul v-else v-for="request in filteredList" :key="request.user.id">
      <li>
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
      </li>
    </ul>
  </div>
</template>

<style>
.container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.container::-webkit-scrollbar {
  display: none;
}
</style>
