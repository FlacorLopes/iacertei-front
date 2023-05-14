<template>
  <van-space direction="vertical" fill>
    <h1 class="text-xl">Olá, {{ userStore.loggedUser.name }} 🤗</h1>

    <div class="mt-8">
      <h3 class="text-md">Qual trivia você quer jogar agora?</h3>
      <paginated-trivias class="mt-2" playable />
    </div>
  </van-space>
</template>

<script setup lang="ts">
import { useUserStore } from "~/stores/userStore";

const userStore = useUserStore();
</script>
