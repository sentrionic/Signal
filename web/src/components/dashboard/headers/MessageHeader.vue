<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { Bars3Icon } from '@heroicons/vue/24/outline';
import SearchInput from './components/SearchInput.vue';
import DropdownMenu from './components/DropdownMenu.vue';
import { storeToRefs } from 'pinia';
import IconButton from '../../common/IconButton.vue';
import { useSidebarStore } from '../../../stores/sidebarStore';

const store = useSidebarStore();
const { query } = storeToRefs(store);
const { updateQuery } = store;

const visible = ref(false);

const onHide = () => (visible.value = false);
const onToggle = () => (visible.value = !visible.value);

const wrapper = ref<HTMLDivElement>();

onClickOutside(wrapper, () => {
  if (!visible.value) return;
  visible.value = false;
});
</script>

<template>
  <div class="flex items-center justify-between h-full mx-4 z-10" ref="wrapper">
    <IconButton description="Open Menu" :handleClick="onToggle">
      <Bars3Icon class="w-6 h-6" />
    </IconButton>
    <SearchInput :text="query" @onChanged="updateQuery" />
  </div>
  <transition name="to-bottom">
    <DropdownMenu v-if="visible" :onHide="onHide" />
  </transition>
</template>

<style>
.to-bottom-enter-active,
.to-bottom-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.to-bottom-leave,
.to-bottom-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.to-bottom-enter-active,
.to-bottom-leave-active {
  transition: all 250ms;
}
</style>
