<script lang="ts" setup>
import { ArrowLeftIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline';
import { logout } from '../../../lib/api/handler/account';
import { SidebarMode } from '../../../lib/models/enums';
import router from '../../../router';
import { useSidebarStore } from '../../../stores/sidebarStore';
import { useUserStore } from '../../../stores/userStore';
import IconButton from '@/components/common/IconButton.vue';

const { setMode } = useSidebarStore();
const { updateUser } = useUserStore();

const handdleBack = () => {
  setMode(SidebarMode.MESSAGES);
};

const handleLogout = async () => {
  try {
    await logout();
    updateUser(null);
    router.push('/');
  } catch (err) {
    console.log(err);
  }
};
</script>

<template>
  <div class="flex items-center justify-between h-full mx-4">
    <IconButton description="Go Back" :handleClick="handdleBack">
      <ArrowLeftIcon class="w-6 h-6" />
    </IconButton>
    <div class="relative w-full ml-4">
      <h1 class="text-xl font-bold dark:text-white">Edit Profile</h1>
    </div>
    <IconButton description="Logout" :handleClick="handleLogout">
      <ArrowRightOnRectangleIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
    </IconButton>
  </div>
</template>
