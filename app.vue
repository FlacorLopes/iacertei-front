<template>
  <van-config-provider theme="dark">
    <van-nav-bar class="px-2">
      <template #title>
        <nuxt-link to="/">
          <span class="logo">IAcertei 🎯</span>
        </nuxt-link>
      </template>
      <template #right>
        <nuxt-link to="/admin/login">
          <van-icon name="manager" size="20" />
        </nuxt-link>
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

Locale.use("pt-BR", ptBR);
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
