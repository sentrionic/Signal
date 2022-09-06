<script lang="ts">
export default {
  name: 'LandingRoute',
};
</script>

<template>
  <section class="bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-col items-center justify-center mx-auto md:h-screen lg:py-0">
      <div class="container mx-auto flex py-20 items-center justify-center flex-col">
        <div class="bg-white flex p-20 items-center justify-center flex-col xl:shadow-lg">
          <img
            class="lg:w-2/6 mb-10 object-cover object-center rounded"
            alt="Logo"
            src="@/assets/logo.webp"
          />
          <div class="text-center lg:w-2/3 w-full">
            <h1
              class="mb-8 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white"
            >
              Signal
            </h1>
            <p
              class="mb-8 leading-relaxed font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400"
            >
              An open source chat application using NestJS and Vue.<br />Keep in touch with your
              friends and find new ones!
            </p>
            <div class="flex justify-center space-x-10">
              <router-link
                to="register"
                class="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
              >
                Register
              </router-link>
              <router-link
                to="login"
                class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Login
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
