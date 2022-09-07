<script setup lang="ts">
import { SidebarMode } from '@/lib/models/enums';
import { useSidebarStore } from '@/stores/sidebarStore';
import { storeToRefs } from 'pinia';
import MessageHeader from './headers/MessageHeader.vue';
import ContactHeader from './headers/ContactHeader.vue';
import SettingsHeader from './headers/SettingsHeader.vue';
import RequestHeader from './headers/RequestHeader.vue';
import MessageSidebar from './sidebar/MessageSidebar.vue';
import ContactSidebar from './sidebar/ContactSidebar.vue';
import SettingsSidebar from './sidebar/SettingsSidebar.vue';
import RequestsSidebar from './sidebar/RequestsSidebar.vue';

const store = useSidebarStore();
const { mode } = storeToRefs(store);
</script>

<script lang="ts">
export default {
  name: 'AppSidebar',
};
</script>

<template>
  <div class="z-10 sidebar-header">
    <MessageHeader v-if="mode === SidebarMode.MESSAGES" />
    <ContactHeader v-if="mode === SidebarMode.CONTACTS" />
    <SettingsHeader v-if="mode === SidebarMode.SETTINGS" />
    <RequestHeader v-if="mode === SidebarMode.REQUESTS" />
  </div>
  <div class="sidebar">
    <MessageSidebar v-if="mode === SidebarMode.MESSAGES" />
    <ContactSidebar v-if="mode === SidebarMode.CONTACTS" />
    <SettingsSidebar v-if="mode === SidebarMode.SETTINGS" />
    <RequestsSidebar v-if="mode === SidebarMode.REQUESTS" />
  </div>
</template>

<style>
.sidebar {
  grid-row-start: sidebar;
  grid-column-start: sidebar;
  grid-row-end: sidebar;
  grid-column-end: sidebar;
  padding: 0.5rem;
}
</style>
