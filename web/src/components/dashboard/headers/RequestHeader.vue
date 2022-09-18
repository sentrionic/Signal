<script lang="ts" setup>
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import { storeToRefs } from 'pinia';
import { SidebarMode } from '../../../lib/models/sidebar-mode';
import { useSidebarStore } from '../../../stores/sidebarStore';
import SearchInput from './components/SearchInput.vue';
import IconButton from '../../common/IconButton.vue';

const store = useSidebarStore();
const { query } = storeToRefs(store);
const { updateQuery, setMode } = store;

const handdleBack = () => {
  setMode(SidebarMode.MESSAGES);
};
</script>

<template>
  <div class="flex items-center justify-between h-full mx-4">
    <IconButton description="Go Back" :handleClick="handdleBack">
      <ArrowLeftIcon class="w-6 h-6 dark:text-iconsDark" />
    </IconButton>
    <SearchInput :text="query" @onChanged="updateQuery" />
  </div>
</template>
