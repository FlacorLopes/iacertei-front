<template>
  <van-config-provider theme="dark">
    <van-nav-bar class="px-2" @click-right="handleSideBarDisplay">
      <template #title>
        <nuxt-link to="/">
          <span class="logo">IAcertei 🎯</span>
        </nuxt-link>
      </template>
      <template #right>
        <van-space fill>
          <span
            v-if="connectionStatus !== undefined"
            :class="connectionStatus ? 'text-lime-500' : 'text-red-700'"
            >{{ connectionStatus ? "conectado" : "desconectado" }}</span
          >
          <van-icon name="manager" size="20" />
          <van-sidebar v-if="showSideBar" class="absolute right-0 top-10">
            <van-sidebar-item
              title="Jogar"
              :to="`/user/${userStore.loggedUser.id}`"
            />
            <van-sidebar-item title="Sair" @click="userStore.logout" />
          </van-sidebar>
        </van-space>
      </template>
    </van-nav-bar>

    <div class="p-4 sm:p-8">
      <nuxt-page />
    </div>
  </van-config-provider>
</template>

<script setup lang="ts">
import "@vant/touch-emulator";
import { Locale } from "vant";
import ptBR from "vant/es/locale/lang/pt-BR";
import { useUserStore } from "./stores/userStore";

Locale.use("pt-BR", ptBR);

const showSideBar = ref(false);
const connectionStatus = ref<boolean | undefined>();
const userStore = useUserStore();

provide(
  "setConnectionStatus",
  (status: boolean) => (connectionStatus.value = status)
);

useServerSeoMeta({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - IAcertei` : "IAcertei";
  },
  ogTitle: "IAcertei",
  description: "Trivias com Inteligência Artificial",
  ogDescription: "Trivias com Inteligência Artificial",
  ogImage: "https://example.com/image.png",
  twitterCard: "summary_large_image",
});

function handleSideBarDisplay() {
  if (userStore.loggedUser.id) {
    showSideBar.value = !showSideBar.value;
    return;
  }

  navigateTo("/login");
  showSideBar.value = false;
}
</script>

<style>
.logo {
  cursor: pointer;
}

.van-theme-dark body {
  color: #f5f5f5;
  background-color: #202124;
}
</style>
