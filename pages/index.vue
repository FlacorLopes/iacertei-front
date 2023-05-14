<template>
  <div class="flex w-full flex-col gap-3">
    <div
      class="min-h-[200px] min-w-[200px] max-w-fit cursor-move border-4 border-solid border-red-600 px-2"
      v-for="b in blocks"
      :key="b.id"
      :id="b.id.toString()"
      v-on="handlers"
      draggable="true"
    >
      Div {{ b.id }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDraggable } from "@vueuse/core";

const blocks = ref([
  {
    id: 0,
  },
  {
    id: 1,
  },
  {
    id: 2,
  },
  {
    id: 3,
  },
  {
    id: 4,
  },
  {
    id: 5,
  },
  {
    id: 6,
  },
  {
    id: 7,
  },
  {
    id: 8,
  },
  {
    id: 9,
  },
]);

const { start, handlers } = useDragHandler();
</script>

<style scoped>
.over {
  border: 3px dotted #666;
}
</style>
