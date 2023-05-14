import { io, Socket } from "socket.io-client";
export function useSocketIO(params?: {
  onStatusChange?: (s: boolean) => void;
}) {
  const config = useRuntimeConfig();
  const state = reactive({
    connected: false,
  });

  const socket = ref<Socket>();

  function connect() {
    socket.value = io(config.public.websocket);

    socket.value.on("connect", () => {
      state.connected = true;
    });

    socket.value.on("disconnect", () => {
      state.connected = false;
    });
  }

  watch(
    () => state.connected,
    (con) => {
      if (params?.onStatusChange) params.onStatusChange(con);
    }
  );

  onBeforeUnmount(() => {
    if (socket.value && socket.value.connected) {
      socket.value.disconnect();
    }
  });

  return {
    socket,
    state,
    connect,
  };
}
