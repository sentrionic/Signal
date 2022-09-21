<script setup lang="ts">
import { useRequestsQuery } from '@/lib/composable/query/useRequestsQuery';
import { computed } from 'vue';
import { useSidebarStore } from '@/stores/sidebarStore';
import { storeToRefs } from 'pinia';
import RequestItem from '../../items/RequestItem.vue';

const { data } = useRequestsQuery();
const store = useSidebarStore();
const { query } = storeToRefs(store);

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
        <RequestItem :request="request" />
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
