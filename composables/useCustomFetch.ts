import type { UseFetchOptions } from "nuxt/app";
import { defu } from "defu";

export function useCustomFetch<T>(
  url: string,
  options: UseFetchOptions<T> = {}
) {
  const userAuth = useCookie("authToken");
  const config = useRuntimeConfig();

  const defaults: UseFetchOptions<T> = {
    baseURL: config.public.api,
    // cache request
    key: url,

    // set user token if connected
    headers: userAuth.value
      ? { Authorization: `Bearer ${userAuth.value}` }
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
