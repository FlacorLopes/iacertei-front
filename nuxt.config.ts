// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@vant/nuxt",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@vueuse/nuxt",
  ],

  typescript: {
    strict: true,
  },
  runtimeConfig: {
    public: {
      api: "http://192.168.1.8:3001",
      websocket: "ws://192.168.1.8:3001",
    },
  },
});
