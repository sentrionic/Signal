import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin, type VueQueryPluginOptions } from 'vue-query';
import './index.css';
import 'flowbite';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const options: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        cacheTime: 0,
      },
    },
  },
};

app.use(VueQueryPlugin, options);

app.mount('#app');
