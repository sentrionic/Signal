<script lang="ts" setup>
import SearchIcon from '../../../icons/SearchIcon.vue';
import IconButton from '../../../common/IconButton.vue';
import { XMarkIcon } from '@heroicons/vue/24/solid';

defineProps<{
  text: string;
}>();

const emit = defineEmits<{
  (event: 'onChanged', query: string): void;
}>();
</script>

<template>
  <div class="relative w-full ml-4">
    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
      <SearchIcon />
    </div>
    <input
      type="text"
      id="simple-search"
      class="search-input"
      placeholder="Search"
      required
      :value="text"
      @input="event => emit('onChanged', (event.target as HTMLInputElement).value)"
    />
    <div class="flex absolute inset-y-0 right-0 items-center pr-3">
      <IconButton description="Clear Search" :handleClick="() => emit('onChanged', '')">
        <XMarkIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </IconButton>
    </div>
  </div>
</template>

<style>
.search-input {
  @apply border border-gray-300 text-gray-900 rounded-3xl focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2 dark:bg-formDark dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
</style>
