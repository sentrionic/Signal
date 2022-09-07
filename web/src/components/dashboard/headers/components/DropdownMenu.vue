<script lang="ts" setup>
import DropdownMenuItem from './DropdownMenuItem.vue';
import ToggleDarkModeItem from './ToggleDarkModeItem.vue';
import { UserIcon, Cog6ToothIcon, InboxIcon } from '@heroicons/vue/24/outline';
import { useSidebarStore } from '../../../../stores/sidebarStore';
import { SidebarMode } from '../../../../lib/models/enums';

const props = defineProps<{ onHide: () => void }>();

const { setMode } = useSidebarStore();
const handleSelectMode = (mode: SidebarMode) => {
  setMode(mode);
  props.onHide();
};
</script>

<template>
  <div
    class="w-64 bg-white rounded divide-y divide-gray-100 dark:bg-gray-700 ml-2 mt-2 shadow-lg p-1"
  >
    <ul class="py-1 dark:text-gray-200 font-semibold">
      <DropdownMenuItem
        title="Contacts"
        :handleClick="() => handleSelectMode(SidebarMode.CONTACTS)"
      >
        <UserIcon class="icon" />
      </DropdownMenuItem>

      <DropdownMenuItem
        title="Requests"
        :handleClick="() => handleSelectMode(SidebarMode.REQUESTS)"
      >
        <InboxIcon class="icon" />
      </DropdownMenuItem>

      <DropdownMenuItem
        title="Settings"
        :handleClick="() => handleSelectMode(SidebarMode.SETTINGS)"
      >
        <Cog6ToothIcon class="icon" />
      </DropdownMenuItem>

      <ToggleDarkModeItem />
    </ul>
  </div>
</template>

<style>
.icon {
  @apply w-4 h-4 mr-3;
}
</style>
