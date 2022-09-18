<script setup lang="ts">
import { GroupSchema } from '@/lib/validation/group.schema';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import FormField from '@/components/form/FormField.vue';
import FormButton from '@/components/form/FormButton.vue';
import TypeaheadInputVue from '@/components/common/TypeaheadInput.vue';
import { useFriendsQuery } from '@/lib/composable/useFriendsQuery';
import type { ChatResponse, CreateGroupDto, UserResponse } from '@/lib/api';
import AddImageIcon from '../../icons/AddImageIcon.vue';
import IconButton from '@/components/common/IconButton.vue';
import { XMarkIcon } from '@heroicons/vue/24/solid';
import { createGroup } from '@/lib/api/handler/groups';
import { useRouter } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebarStore';
import { SidebarMode } from '@/lib/models/sidebar-mode';
import { useQueryClient } from 'vue-query';
import { cKey } from '@/lib/composable/useChatsQuery';

const { data } = useFriendsQuery();
const { setMode } = useSidebarStore();
const cache = useQueryClient();

const { errors, values, isSubmitting, setFieldValue } = useForm<CreateGroupDto>({
  validationSchema: GroupSchema,
});

const file = ref<File | null>(null);
const fileRef = ref<HTMLFormElement | null>(null);
const imageUrl = ref<string | null>();
const router = useRouter();

const onFileSelect = () => {
  const selectedFile = fileRef?.value?.files[0];
  file.value = selectedFile;
  imageUrl.value = URL.createObjectURL(selectedFile);
};

const selectedMembers = ref<UserResponse[]>([]);

const handleSelect = (item: UserResponse) => {
  if (selectedMembers.value.includes(item)) return;
  selectedMembers.value = [...selectedMembers.value, item];
};

const handleRemove = (id: string) => {
  selectedMembers.value = [...selectedMembers.value.filter((c) => c.id !== id)];
};

const handleSubmit = async () => {
  setFieldValue(
    'ids',
    selectedMembers.value.map((c) => c.id)
  );

  try {
    const response = await createGroup(values);
    cache.setQueryData<ChatResponse[]>(cKey, (old) => {
      if (!old) return [];
      return [response, ...old];
    });
    router.push({ name: 'dashboard', params: { id: response.id } });
    setMode(SidebarMode.MESSAGES);
  } catch (err) {
    console.log(err);
  }
};
</script>

<template>
  <form class="space-y-4 md:space-y-6 p-4" @submit.prevent="handleSubmit">
    <div class="flex w-full justify-center">
      <img
        v-if="imageUrl"
        class="w-28 h-28 rounded-full hover:cursor-pointer hover:opacity-50 transition-opacity"
        :src="imageUrl"
        alt="Group Icon"
        @click="fileRef?.click()"
      />
      <div
        v-else
        @click="fileRef?.click()"
        class="overflow-hidden relative w-28 h-28 bg-gray-100 rounded-full hover:cursor-pointer hover:opacity-50 transition-opacity"
      >
        <AddImageIcon />
      </div>
      <input type="file" class="hidden" ref="fileRef" @change="onFileSelect" />
    </div>
    <FormField label="Group Name" name="name" :error="errors?.name" type="text" />
    <TypeaheadInputVue
      placeholder="Add contacts"
      :items="[...(data ?? [])]"
      :minInputLength="1"
      @selectItem="handleSelect"
      :itemProjection="(item: UserResponse) => item.displayName"
    >
    </TypeaheadInputVue>
    <div v-if="selectedMembers.length !== 0">
      <p>Added contacts:</p>
      <ul
        v-for="member in selectedMembers"
        :key="member.id"
        class="max-w-md divide-y divide-gray-200 dark:divide-gray-700 mx-1 mt-4"
      >
        <li class="pb-3 sm:pb-4">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <img class="w-8 h-8 rounded-full" :src="member.image" alt="Neil image" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                {{ member.displayName }}
              </p>
            </div>
            <div
              class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
            >
              <IconButton description="Decline" :handleClick="() => handleRemove(member.id)">
                <XMarkIcon class="text-red-800 w-6 h-6" />
              </IconButton>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div></div>
    <FormButton :isSubmitting="isSubmitting" label="Create" />
  </form>
</template>
