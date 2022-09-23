<script lang="ts" setup>
import { ref, type InputHTMLAttributes } from 'vue';
import { MoonIcon } from '@heroicons/vue/24/outline';

const isDark =
  localStorage.getItem('color-theme') === 'dark' ||
  (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

const themeToggle = ref<InputHTMLAttributes>();

const handleThemeToggle = () => {
  // if set via local storage previously
  if (localStorage.getItem('color-theme')) {
    if (localStorage.getItem('color-theme') === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
    }

    // if NOT set via local storage previously
  } else {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
    }
  }
};
</script>

<template>
  <li>
    <div class="item justify-between">
      <div class="flex items-center">
        <MoonIcon class="w-4 h-4 mr-3" />
        Dark Mode
      </div>
      <label for="default-toggle" class="inline-flex relative items-center cursor-pointer">
        <input
          :checked="isDark"
          type="checkbox"
          id="default-toggle"
          class="sr-only peer"
          ref="themeToggle"
          @change="handleThemeToggle"
        />
        <div
          class="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"
        ></div>
      </label>
    </div>
  </li>
</template>

<style>
.item {
  @apply flex items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white hover:cursor-pointer;
}
</style>
