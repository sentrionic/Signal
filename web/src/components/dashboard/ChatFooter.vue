<script setup lang="ts">
import { createMessage, updateMessage } from '@/lib/api/handler/messages';
import { useCurrentRoute } from '@/lib/composable/common/useCurrentRoute';
import { PaperAirplaneIcon, PencilSquareIcon } from '@heroicons/vue/24/solid';
import { PhotoIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { computed, ref, watch } from 'vue';
import IconButton from '../common/IconButton.vue';
import { useChatStore } from '@/stores/chatStore';
import { storeToRefs } from 'pinia';
import { useSocket } from '@/lib/composable/common/useSocket';
import { useUserStore } from '@/stores/userStore';

const { current } = useCurrentRoute();
const { user } = useUserStore();
const chatStore = useChatStore();
const { isEditing, message, typing } = storeToRefs(chatStore);

const text = ref<string>('');
const isTyping = ref<boolean>(false);
const socket = useSocket();

watch(
  () => message.value,
  (m) => {
    if (m) text.value = m.text ?? '';
  },
  { immediate: true }
);

watch(
  () => text.value,
  (t) => {
    if (t.trim().length === 1 && !isTyping.value) {
      socket.emit('startTyping', current.value?.id, user?.displayName);
      isTyping.value = true;
    } else if (t.length === 0) {
      socket.emit('stopTyping', current.value?.id, user?.displayName);
      isTyping.value = false;
    }
  }
);

const handleSubmit = async () => {
  if (!current.value) return;
  if (text.value.trim().length === 0) return;

  socket.emit('stopTyping', current.value.id, user?.displayName);
  isTyping.value = false;

  if (isEditing.value) {
    if (!message.value) return;
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

const typingString = computed(() => {
  switch (typing.value.length) {
    case 1:
      return typing.value[0];
    case 2:
      return `${typing.value[0]} and ${typing.value[1]}`;
    case 3:
      return `${typing.value[0]}, ${typing.value[1]} and ${typing.value[2]}`;
    default:
      return 'Several people';
  }
});
</script>

<template>
  <div class="footer relative">
    <form v-if="current" class="flex mx-10 space-x-4 items-center" @submit.prevent="handleSubmit">
      <div class="flex rounded-lg bg-white dark:bg-formDark p-2 shadow-lg w-full">
        <input
          type="text"
          class="text-gray-900 block flex-1 min-w-0 w-full border-none focus:border-none focus:ring-0 dark:bg-formDark dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Message"
          v-model.trim="text"
          :maxlength="2000"
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
    <div v-if="typing.length > 0" class="absolute flex items-center text-xs py-1 mx-12">
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="ml-1 font-semibold dark:text-white">
        {{ typingString }}
      </div>
      <p class="ml-1 dark:text-white">{{ typing.length === 1 ? 'is' : 'are' }} typing...</p>
    </div>
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

.typing-indicator {
  border-radius: 50px;
  display: table;
  position: relative;
  -webkit-animation: 2s bulge infinite ease-out;
  animation: 2s bulge infinite ease-out;
}

.typing-indicator span {
  height: 6px;
  width: 6px;
  float: left;
  margin: 0 1px;
  display: block;
  border-radius: 50%;
  opacity: 0.4;
  @apply bg-black dark:bg-white;
}

.typing-indicator span:nth-of-type(1) {
  -webkit-animation: 1s blink infinite 0.3333s;
  animation: 1s blink infinite 0.3333s;
}

.typing-indicator span:nth-of-type(2) {
  -webkit-animation: 1s blink infinite 0.6666s;
  animation: 1s blink infinite 0.6666s;
}

.typing-indicator span:nth-of-type(3) {
  -webkit-animation: 1s blink infinite 0.9999s;
  animation: 1s blink infinite 0.9999s;
}

@-webkit-keyframes blink {
  50% {
    opacity: 1;
  }
}

@keyframes blink {
  50% {
    opacity: 1;
  }
}

@-webkit-keyframes bulge {
  50% {
    -webkit-transform: scale(1.05);
    transform: scale(1.05);
  }
}

@keyframes bulge {
  50% {
    -webkit-transform: scale(1.05);
    transform: scale(1.05);
  }
}
</style>
