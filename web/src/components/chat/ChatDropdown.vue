<script lang="ts" setup>
import { UserPlusIcon } from '@heroicons/vue/24/outline';
import DropdownMenuItem from '../dashboard/headers/components/DropdownMenuItem.vue';
import LeaveGroupIcon from '../icons/LeaveGroupIcon.vue';

const emit = defineEmits<{
  (event: 'handleAdd'): void;
  (event: 'handleLeave'): void;
}>();
</script>

<template>
  <div
    class="w-64 bg-white rounded divide-y divide-gray-100 dark:bg-menuDark ml-2 mt-2 shadow-lg p-1"
  >
    <ul class="py-1 dark:text-gray-200 font-semibold">
      <DropdownMenuItem title="Add Member" :handleClick="() => emit('handleAdd')">
        <UserPlusIcon class="icon" />
      </DropdownMenuItem>

      <DropdownMenuItem
        title="Leave Group"
        class="text-red-500 hover:text-red-500"
        :handleClick="() => emit('handleLeave')"
      >
        <LeaveGroupIcon />
      </DropdownMenuItem>
    </ul>
  </div>
</template>

<style>
.icon {
  @apply w-4 h-4 mr-3;
}
</style>
