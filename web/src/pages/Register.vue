<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { HTTPError } from 'ky';
import router from '@/router';
import { useForm } from 'vee-validate';
import { toErrorMap } from '@/lib/utils/toErrorMap';
import { RegisterSchema } from '@/lib/validation/user.schema';
import FormWrapper from '../components/form/FormWrapper.vue';
import FormField from '../components/form/FormField.vue';
import FormHeader from '../components/form/FormHeader.vue';
import FormButton from '../components/form/FormButton.vue';
import { register } from '@/lib/api/handler/account';
import type { FieldError, RegisterInput } from '@/lib/api';

const { errors, values, setFieldError, setErrors, isSubmitting } = useForm<RegisterInput>({
  validationSchema: RegisterSchema,
});

const { updateUser } = useUserStore();

const handleSubmit = async () => {
  try {
    const result = await register(values);
    updateUser(result);
    router.push('/dashboard');
  } catch (err) {
    if (err instanceof HTTPError) {
      if (err.response.status === 409)
        setFieldError('email', 'An account with that email already exists');
      else if (err.response.status === 400) {
        const errors = (await err.response.json())['errors'] as FieldError[];
        setErrors(toErrorMap(errors));
      } else setFieldError('email', 'Server Error');
    }
  }
};
</script>

<script lang="ts">
export default {
  name: 'RegisterRoute',
};
</script>

<template>
  <FormWrapper title="Welcome!">
    <FormHeader title="Create your account" />
    <form class="space-y-4 md:space-y-6" @submit.prevent="handleSubmit">
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
      <FormField
        label="Password"
        name="password"
        :error="errors?.password"
        autocomplete="current-password"
        type="password"
      />
      <div></div>
      <FormButton :isSubmitting="isSubmitting" label="Sign up" />
      <p class="font-light text-gray-500 dark:text-gray-400">
        Already have an account?
        <router-link
          to="login"
          class="font-medium text-primary-600 hover:underline dark:text-primary-400"
          >Sign in
        </router-link>
      </p>
    </form>
  </FormWrapper>
</template>
