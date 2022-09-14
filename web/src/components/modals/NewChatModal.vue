<script setup lang="ts">
import { SidebarMode } from '@/lib/models/enums';
import { useSidebarStore } from '@/stores/sidebarStore';
import { UserIcon, UsersIcon } from '@heroicons/vue/24/outline';

const { setMode } = useSidebarStore();
</script>

<template>
  <div
    class="absolute bottom-20 right-4 z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-menuDark"
  >
    <ul
      class="py-1 text-sm text-black dark:text-gray-200 shadow-lg rounded-xl font-medium"
      aria-labelledby="dropdownTopButton"
    >
      <li>
        <p
          @click="setMode(SidebarMode.CREATE_GROUP)"
          class="flex py-2 mx-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white hover:cursor-pointer rounded-md"
        >
          <UsersIcon class="w-5 h-5 mr-3" />
          New Group
        </p>
      </li>
      <li>
        <p
          @click="setMode(SidebarMode.CONTACTS)"
          class="flex py-2 mx-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white hover:cursor-pointer rounded-md"
        >
          <UserIcon class="w-5 h-5 mr-3" />
          New Private Chat
        </p>
      </li>
    </ul>
  </div>
</template>
