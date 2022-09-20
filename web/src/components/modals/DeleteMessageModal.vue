<script setup lang="ts">
import type { MessageResponse } from '@/lib/api/index';
import ModalWrapper from './ModalWrapper.vue';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import { deleteMessage } from '@/lib/api/handler/messages';
import { formatSentAt } from '@/lib/utils/dateUtils';

const props = defineProps<{
  message: MessageResponse;
  onClose: () => void;
}>();

const handleSubmit = async () => {
  try {
    await deleteMessage(props.message.id);
    props.onClose();
  } catch (err) {
    console.log(err);
  }
};
</script>

<template>
  <ModalWrapper>
    <div class="bg-white dark:bg-menuDark px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div class="sm:flex sm:items-start">
        <div
          class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
        >
          <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
            Delete Message
          </h3>
          <div class="mt-2">
            <p class="text-gray-500 dark:text-gray-300">
              Are you sure you want to delete this message?
            </p>
            <div
              v-if="message.type === 'TEXT'"
              class="py-2 px-4 m-2 w-fit rounded-2xl shadow-sm bg-slate-500 dark:bg-slate-800 text-white"
            >
              <p class="truncate sm:max-w-xs xl:max-w-sm">
                {{ message.text }}
              </p>
              <p class="text-xs text-grey-dark mt-1">
                {{ formatSentAt(message.sentAt) }}
              </p>
            </div>
            <div v-else-if="message.type === 'IMAGE'" class="py-2 rounded-2xl">
              <img
                class="sm:max-w-sm xl:max-w-md h-auto rounded-lg shadow-sm"
                :src="message.attachment?.url"
                alt="Message Attachment"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
      <button
        @click="handleSubmit"
        type="button"
        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
      >
        Delete
      </button>
      <button
        @click="onClose"
        type="button"
        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
      >
        Cancel
      </button>
    </div>
  </ModalWrapper>
</template>
