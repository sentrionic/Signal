<script setup lang="ts">
import ChatHeader from '../components/dashboard/ChatHeader.vue';
import ChatFooter from '../components/dashboard/ChatFooter.vue';
import ChatBody from '../components/dashboard/ChatBody.vue';
import Sidebar from '../components/dashboard/Sidebar.vue';
</script>

<script lang="ts">
export default {
  name: 'DashboardRoute',
};
</script>

<template>
  <div class="app-layout">
    <ChatHeader />
    <Sidebar />
    <ChatBody />
    <ChatFooter />
  </div>
</template>

<style>
.app-layout {
  display: grid;
  grid-template:
    'sidebar-header header' 56px
    'sidebar main' 1fr
    'sidebar footer' 75px / 420px 1fr;
  height: 100vh;
}
</style>
