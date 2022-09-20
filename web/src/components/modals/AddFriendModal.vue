<script setup lang="ts">
import { sendRequest } from '@/lib/api/handler/requests';
import { FriendSchema } from '@/lib/validation/user.schema';
import type { HTTPError } from 'ky';
import { useForm } from 'vee-validate';
import FormField from '../form/FormField.vue';
import ModalWrapper from './ModalWrapper.vue';

const props = defineProps<{
  onClose: () => void;
}>();

const { errors, values, setFieldError } = useForm({
  validationSchema: FriendSchema,
});

const handleSubmit = async () => {
  try {
    await sendRequest(values.username);
    props.onClose();
  } catch (err) {
    const error = err as HTTPError;
    if (error.response.status === 404)
      setFieldError('username', 'A user with that name does not exist');
    else setFieldError('username', 'Server Error');
  }
};
</script>

<template>
  <ModalWrapper>
    <div class="bg-white dark:bg-menuDark px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Add User</h3>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <FormField
          label="Username"
          name="username"
          type="text"
          placeholder="Enter a Username#0000"
          :error="errors.username"
        />
      </form>
    </div>
    <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
      <button type="button" @click="handleSubmit" class="btn-primary">Add User</button>
      <button type="button" @click="onClose" class="btn-cancel">Cancel</button>
    </div>
  </ModalWrapper>
</template>

<style>
.btn-primary {
  @apply w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 hover:bg-primary-700 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm;
}

.btn-cancel {
  @apply mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm;
}
</style>
