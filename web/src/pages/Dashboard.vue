<script setup lang="ts">
import ChatHeader from '../components/dashboard/ChatHeader.vue';
import ChatFooter from '../components/dashboard/ChatFooter.vue';
import ChatBody from '../components/dashboard/ChatBody.vue';
import Sidebar from '../components/dashboard/Sidebar.vue';
import ChatInfo from '../components/dashboard/ChatInfo.vue';
import ChatInfoHeader from '../components/dashboard/headers/ChatInfoHeader.vue';
import { useInfoStore } from '@/stores/infoStore';
import { storeToRefs } from 'pinia';
import { useCurrentRoute } from '@/lib/composable/common/useCurrentRoute';
import { useUserSocket } from '@/lib/composable/ws/useUserSocket';

const store = useInfoStore();
const { isVisible } = storeToRefs(store);
const { current } = useCurrentRoute();

useUserSocket();
</script>

<script lang="ts">
export default {
  name: 'DashboardRoute',
};
</script>

<template>
  <div :class="isVisible ? 'app-layout' : 'app-layout-slim'">
    <ChatHeader />
    <Sidebar />
    <ChatBody />
    <ChatFooter :key="current?.id" />
    <ChatInfoHeader v-if="isVisible" />
    <ChatInfo v-if="isVisible" />
  </div>
</template>

<style>
@media (min-width: 0px) {
  .app-layout-slim {
    display: grid;
    grid-template:
      'sidebar-header header info-header' 56px
      'sidebar main info' 1fr
      'sidebar footer info' 85px / 300px 1fr;
    height: 100vh;

    @apply bg-white dark:bg-bgDark;
  }
}

@media (min-width: 1000px) {
  .app-layout-slim {
    display: grid;
    grid-template:
      'sidebar-header header info-header' 56px
      'sidebar main info' 1fr
      'sidebar footer info' 85px / 420px 1fr;
    height: 100vh;

    @apply bg-white dark:bg-bgDark;
  }
}

@media (min-width: 0px) {
  .app-layout {
    display: grid;
    grid-template:
      'sidebar-header header info-header' 56px
      'sidebar main info' 1fr
      'sidebar footer info' 85px / 200px 1fr 200px;
    height: 100vh;

    @apply bg-white dark:bg-bgDark;
  }
}

@media (min-width: 800px) {
  .app-layout {
    display: grid;
    grid-template:
      'sidebar-header header info-header' 56px
      'sidebar main info' 1fr
      'sidebar footer info' 85px / 300px 1fr 300px;
    height: 100vh;

    @apply bg-white dark:bg-bgDark;
  }
}

@media (min-width: 1200px) {
  .app-layout {
    display: grid;
    grid-template:
      'sidebar-header header info-header' 56px
      'sidebar main info' 1fr
      'sidebar footer info' 85px / 420px 1fr 420px;
    height: 100vh;

    @apply bg-white dark:bg-bgDark;
  }
}
</style>
