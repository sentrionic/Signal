<template>
  <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="background"></div>
    <div class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
        <div class="wrapper">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.background {
  @apply fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity;
}

.wrapper {
  @apply sm:my-8 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl sm:w-full;
  @apply relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all;
}
</style>
