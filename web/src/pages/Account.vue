<script setup lang="ts">
import type { FieldError, User } from '../lib/models/models';
import { useUserStore } from '@/stores/userStore';
import { handler } from '@/lib/api/handler';
import { HTTPError } from 'ky';
import { useForm } from 'vee-validate';
import { UpdateSchema } from '@/lib/validation/user.schema';
import { toErrorMap } from '@/lib/utils/toErrorMap';
import { ref } from 'vue';
import FormWrapper from '../components/form/FormWrapper.vue';
import FormButton from '../components/form/FormButton.vue';
import FormField from '../components/form/FormField.vue';
import { useToast } from '@/lib/composable/useToast';
import SuccessErrorToast from '../components/common/SuccessErrorToast.vue';

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

const update = async () => {
  try {
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('displayName', values.displayName);

    if (file.value) formData.append('image', file.value);

    const result = await handler.put('accounts', { body: formData }).json<User>();
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
  <FormWrapper title="Update Account">
    <form class="space-y-4 md:space-y-6" @submit.prevent="update">
      <div class="flex w-full justify-center">
        <img
          class="w-28 h-28 rounded-full hover:cursor-pointer hover:opacity-50 transition-opacity"
          :src="imageUrl"
          :alt="user?.displayName"
          @click="fileRef?.click()"
        />
        <input type="file" class="hidden" ref="fileRef" @change="onFileSelect" />
      </div>
      <div></div>
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
      <div></div>
      <FormButton :isSubmitting="isSubmitting" label="Update" />
    </form>
  </FormWrapper>
  <SuccessErrorToast
    success="Successfully updated your account"
    error="Server Error. Try again later"
  />
</template>

<script lang="ts">
export default {
  name: 'AccountRoute',
};
</script>
