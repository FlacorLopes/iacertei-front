import { defineStore } from "pinia";

export const useUserStore = defineStore(
  "user",
  () => {
    const emptyLoggedUser = {
      id: "",
      name: "",
      email: "",
      accessToken: "",
    };

    const loggedUser = ref(emptyLoggedUser);

    async function logout() {
      loggedUser.value = emptyLoggedUser;
      await navigateTo({ path: "login" });
    }
    return {
      loggedUser,
      logout,
    };
  },
  {
    persist: {
      storage: persistedState.cookiesWithOptions({
        sameSite: true,
        maxAge: 60 * 60 * 24,
      }),
    },
  }
);
