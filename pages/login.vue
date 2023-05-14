<template>
  <div class="flex min-h-[80vh] flex-col items-center justify-center space-y-2">
    <van-form class="max-w-sm space-y-2" @submit="onSubmit">
      <van-cell-group inset>
        <van-field v-model="email" label="Email" />
        <van-field v-model="password" type="password" label="Senha" />
      </van-cell-group>
      <van-button
        type="primary"
        class="min-w-full"
        native-type="submit"
        loading-type="spinner"
        :loading="loading"
        >Entrar</van-button
      >
    </van-form>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from "~/stores/userStore";

const config = useRuntimeConfig();
const userStore = useUserStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

async function onSubmit() {
  const { api } = config.public;
  try {
    loading.value = true;

    const resp: SignInResponseDto = await $fetch("/auth/signIn", {
      baseURL: `${api}`,
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
    });

    userStore.loggedUser = resp;

    navigateTo(`/user/${userStore.loggedUser.id}`);
  } catch (error) {
    showFailToast({
      message: "Ocorreu um erro ao logar.",
      wordBreak: "break-word",
      icon: "clear",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.van-cell-group--inset {
  margin: 0;
}
</style>
