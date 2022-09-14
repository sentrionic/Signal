<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import type { HTTPError } from 'ky';
import router from '@/router';
import { useForm } from 'vee-validate';
import { LoginSchema } from '@/lib/validation/user.schema';
import FormWrapper from '../components/form/FormWrapper.vue';
import FormField from '../components/form/FormField.vue';
import FormHeader from '../components/form/FormHeader.vue';
import FormButton from '../components/form/FormButton.vue';
import { login } from '@/lib/api/handler/account';
import type { LoginInput } from '@/lib/api';

const { errors, values, setFieldError, isSubmitting } = useForm<LoginInput>({
  validationSchema: LoginSchema,
});

const { updateUser } = useUserStore();

const handleSubmit = async () => {
  try {
    const result = await login(values);
    updateUser(result);
    router.push('/dashboard');
  } catch (err) {
    const error = err as HTTPError;
    if (error.response.status === 401) setFieldError('email', 'Invalid Credentials');
    else setFieldError('email', 'Server Error');
  }
};
</script>

<script lang="ts">
export default {
  name: 'LoginRoute',
};
</script>

<template>
  <FormWrapper title="Welcome Back!">
    <FormHeader title="Sign into your account" />
    <form class="space-y-4 md:space-y-6" @submit.prevent="handleSubmit">
      <FormField
        label="Email"
        name="email"
        :error="errors?.email"
        autocomplete="username"
        type="email"
      />

      <FormField
        label="Password"
        name="password"
        :error="errors?.password"
        autocomplete="current-password"
        type="password"
      />
      <div></div>
      <FormButton :isSubmitting="isSubmitting" label="Sign in" />
      <p class="font-light text-gray-500 dark:text-gray-400">
        Don't have an account yet?
        <router-link
          to="register"
          class="font-medium text-primary-600 hover:underline dark:text-primary-400"
          >Sign up
        </router-link>
      </p>
    </form>
  </FormWrapper>
</template>
