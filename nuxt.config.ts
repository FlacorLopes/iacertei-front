// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@vant/nuxt", "@nuxtjs/tailwindcss", "@vueuse/nuxt"],
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    public: {
      api: "http://192.168.0.10:3001",
    },
  },
});
