<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { HTTPError } from 'ky';
import { useForm } from 'vee-validate';
import { UpdateSchema } from '@/lib/validation/user.schema';
import { toErrorMap } from '@/lib/utils/toErrorMap';
import { ref } from 'vue';
import { useToast } from '@/lib/composable/useToast';
import FormField from '@/components/form/FormField.vue';
import FormButton from '@/components/form/FormButton.vue';
import SuccessErrorToast from '@/components/common/SuccessErrorToast.vue';
import { updateAccount } from '@/lib/api/handler/account';
import { useClipboard } from '@vueuse/core';
import type { FieldError } from '@/lib/api';

const { user, updateUser } = useUserStore();

const { errors, values, setFieldError, resetForm, setErrors, isSubmitting } = useForm({
  validationSchema: UpdateSchema,
});

resetForm({ values: { ...user } });

const file = ref<File | null>(null);
const fileRef = ref<HTMLFormElement | null>(null);
const imageUrl = ref<string>(user?.image || '');

const onFileSelect = () => {
  const selectedFile = fileRef?.value?.files[0];
  file.value = selectedFile;
  imageUrl.value = URL.createObjectURL(selectedFile);
};

const { copy, copied } = useClipboard({ source: user?.username });

const update = async () => {
  try {
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('displayName', values.displayName);
    formData.append('bio', values.bio);

    if (file.value) formData.append('image', file.value);

    const result = await updateAccount(formData);
    updateUser(result);
    useToast({ type: 'success' });
  } catch (err) {
    if (err instanceof HTTPError) {
      if (err.response.status === 409)
        setFieldError('email', 'An account with that email already exists');
      else if (err.response.status === 400) {
        const errors = (await err.response.json())['errors'] as FieldError[];
        setErrors(toErrorMap(errors));
      } else setFieldError('email', 'Server Error');
    }
    useToast({ type: 'error' });
  }
};
</script>

<template>
  <form class="space-y-4 md:space-y-6 p-4" @submit.prevent="update">
    <div class="flex w-full justify-center">
      <img
        class="w-28 h-28 rounded-full hover:cursor-pointer hover:opacity-50 transition-opacity"
        :src="imageUrl"
        :alt="user?.displayName"
        @click="fileRef?.click()"
      />
      <input type="file" class="hidden" ref="fileRef" @change="onFileSelect" />
    </div>
    <div class="w-full justify-center flex relative">
      <h6
        class="text-lg font-bold text-gray-600 dark:text-white hover:cursor-pointer"
        @click="copy()"
      >
        {{ user?.username }}
      </h6>
      <div
        v-if="copied"
        class="inline-block absolute z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700 bottom-8"
      >
        Copied!
        <div class="tooltip-arrow" data-popper-arrow></div>
      </div>
    </div>
    <FormField
      label="Email"
      name="email"
      :error="errors?.email"
      autocomplete="username"
      type="email"
    />
    <FormField
      label="Display Name"
      name="displayName"
      :error="errors?.displayName"
      autocomplete="username"
      type="text"
    />
    <FormField label="About Me" name="bio" :error="errors?.bio" type="text" />
    <div></div>
    <FormButton :isSubmitting="isSubmitting" label="Update" />
  </form>
  <SuccessErrorToast
    success="Successfully updated your account"
    error="Server Error. Try again later"
  />
</template>
