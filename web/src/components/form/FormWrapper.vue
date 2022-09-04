<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <section class="bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <h1
        class="mb-4 text-2xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
      >
        {{ title }}
      </h1>
      <div class="form-wrapper">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <slot></slot>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.form-wrapper {
  @apply w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700;
}
</style>
