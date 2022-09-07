<script lang="ts" setup>
import { Field } from 'vee-validate';

interface IFormFieldProps {
  label: string;
  type: string;
  name: string;
  autocomplete?: string;
  error?: string;
  placeholder?: string;
}

defineProps<IFormFieldProps>();
</script>

<template>
  <div>
    <label for="name" class="block mb-2 font-medium text-gray-900 dark:text-white">{{
      label
    }}</label>
    <Field
      :type="type"
      :name="name"
      :id="name"
      :autocomplete="autocomplete"
      :class="error ? 'border-red-700' : 'border-gray-300'"
      class="form-input"
      :placeholder="placeholder"
    >
    </Field>
    <p v-if="error" class="mt-2 text-red-700">
      {{ error }}
    </p>
  </div>
</template>

<style>
.form-input {
  @apply bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
</style>
