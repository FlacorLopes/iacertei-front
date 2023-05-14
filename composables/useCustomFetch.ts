import { useUserStore } from "~/stores/userStore";
import type { UseFetchOptions } from "nuxt/app";
import { defu } from "defu";

export function useCustomFetch<T>(
  url: string,
  options: UseFetchOptions<T> = {}
) {
  const userStore = useUserStore();
  const config = useRuntimeConfig();

  const defaults: UseFetchOptions<T> = {
    baseURL: config.public.api,
    // cache request
    key: url,

    // set user token if connected
    headers: userStore.loggedUser.accessToken
      ? { Authorization: `Bearer ${userStore.loggedUser.accessToken}` }
      : {},

    // onResponse(__ctx) {
    //   // return new myBusinessResponse(response._data)
    // },

    // onResponseError(__ctx) {
    //   console.log(__ctx);
    // },
  };

  // for nice deep defaults, please use unjs/defu
  const params = defu(defaults, options);

  return useFetch(url, params);
}
