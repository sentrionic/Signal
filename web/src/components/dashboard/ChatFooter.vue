<script setup lang="ts">
import { createMessage, updateMessage } from '@/lib/api/handler/messages';
import { useCurrentRoute } from '@/lib/composable/useCurrentRoute';
import { PaperAirplaneIcon, PencilSquareIcon } from '@heroicons/vue/24/solid';
import { PhotoIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { ref, watch } from 'vue';
import IconButton from '../common/IconButton.vue';
import { useChatStore } from '@/stores/chatStore';
import { storeToRefs } from 'pinia';

const { current } = useCurrentRoute();
const chatStore = useChatStore();
const { isEditing, message } = storeToRefs(chatStore);

const text = ref<string>('');

watch(
  () => message.value,
  (m) => {
    if (m) text.value = m.text ?? '';
  },
  { immediate: true }
);

const handleSubmit = async () => {
  if (!current.value) return;
  if (text.value.trim().length === 0) return;

  if (isEditing) {
    if (!message.value?.text) return;
    await updateMessage(message.value.id, text.value);
    handleCancelEdit();
  } else {
    try {
      const form = new FormData();
      form.append('text', text.value);
      await createMessage(current.value.id, form);
      text.value = '';
    } catch (err) {
      console.log(err);
    }
  }
};

const fileRef = ref<HTMLFormElement | null>(null);

const onFileSelect = async () => {
  if (!current.value) return;
  const selectedFile = fileRef?.value?.files[0];
  try {
    const form = new FormData();
    form.append('file', selectedFile);
    await createMessage(current.value.id, form);
  } catch (err) {
    console.log(err);
  }
};

const handleCancelEdit = () => {
  chatStore.setMessage(null);
  chatStore.toggleEditing();
  text.value = '';
};
</script>

<template>
  <div class="footer">
    <form v-if="current" class="flex mx-10 space-x-4 items-center" @submit.prevent="handleSubmit">
      <div class="flex rounded-lg bg-white p-2 shadow-lg w-full">
        <input
          type="text"
          class="text-gray-900 block flex-1 min-w-0 w-full border-none focus:border-none focus:ring-0"
          placeholder="Message"
          v-model="text"
        />
        <IconButton
          v-if="isEditing"
          description="Cancel Editing"
          :handleClick="() => handleCancelEdit()"
        >
          <XMarkIcon class="w-7 h-7" />
        </IconButton>
        <IconButton v-else description="Upload an image" :handleClick="() => fileRef?.click()">
          <PhotoIcon class="w-7 h-7" />
          <input type="file" class="hidden" ref="fileRef" @change="onFileSelect" />
        </IconButton>
      </div>
      <button
        type="submit"
        class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-full p-3 text-center inline-flex items-center mr-2 h-fit shadow-lg"
      >
        <PencilSquareIcon v-if="isEditing" class="w-7 h-7" />
        <PaperAirplaneIcon v-else class="w-7 h-7" />
      </button>
    </form>
  </div>
</template>

<style>
.footer {
  grid-row-start: footer;
  grid-column-start: footer;
  grid-row-end: footer;
  grid-column-end: footer;
  @apply border-l border-borderLight dark:border-borderDark bg-slate-100 dark:bg-black;
}
</style>
