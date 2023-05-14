interface DragListeners {
  ondragstart: (event: DragEvent) => void;
  dragenter: (event: DragEvent) => void;
  dragover: (event: DragEvent) => void;
  dragleave: (event: DragEvent) => void;
  drop: (event: DragEvent) => void;
  dragend: (event: DragEvent) => void;
}

interface DragHandler {
  start: Ref<HTMLElement | null>;
  handlers: ComputedRef<DragListeners>;
}

export function useDragHandler(): DragHandler {
  const start = ref<HTMLElement | null>(null);

  function ondragstart(e: DragEvent) {
    const target = e.target as HTMLElement;
    start.value = target;

    console.log("start", target);
    target.style.opacity = "0.5";
  }

  function dragend(e: Event) {
    const target = e.target as HTMLElement;
    // console.log("end", target);
    target.style.opacity = "1";
    target.classList.remove("over");
  }

  function dragover(e: DragEvent) {
    // console.log("over", e.target);
    e.preventDefault();
    return false;
  }

  function dragenter(e: DragEvent) {
    const target = e.target as HTMLElement;
    console.log("enter", target);
    target.classList.add("over");
  }

  function dragleave(e: DragEvent) {
    const target = e.target as HTMLElement;
    // console.log("leave", target);
    target.classList.remove("over");
  }

  function drop(e: DragEvent) {
    e.stopPropagation();

    const target = e.target as HTMLElement;

    console.log("drop", target.id, start.value?.id);
    // blocks.value[+start.value!.id] = { id: +target.id };
    // blocks.value[+target.id] = { id: +start.value!.id };
    target.classList.remove("over");
    start.value = null;

    return false;
  }

  const handlers: ComputedRef<DragListeners> = computed(() => ({
    ondragstart,
    dragenter,
    dragover,
    dragleave,
    drop,
    dragend,
    onclick() {
      alert();
    },
  }));

  return {
    handlers,
    start,
  };
}
