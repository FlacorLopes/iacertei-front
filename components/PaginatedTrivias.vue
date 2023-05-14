<template>
  <van-space direction="vertical" fill>
    <van-cell-group class="overflow-hidden rounded-xl">
      <van-cell
        v-if="paginatedTrivias?.data"
        v-for="trivia in paginatedTrivias.data"
        :key="trivia.id"
        :title="trivia.title"
        :value="`${trivia.questionsAmount} perguntas`"
        :clickable="playable"
        @click="handleTriviaClick(trivia.id)"
      />
    </van-cell-group>
    <client-only>
      <van-pagination
        v-model="currentPage"
        :total-items="paginatedTrivias?.total ?? 0"
        :items-per-page="currentPageSize"
      />
    </client-only>
  </van-space>
</template>

<script setup lang="ts">
import { ITrivia } from "~/utils/lib/Trivia";

const props = defineProps({
  playable: {
    default: false,
    required: false,
  },
});

const { currentPage, currentPageSize } = useOffsetPagination({
  page: 1,
  pageSize: 10,
});

const { data: paginatedTrivias } = useCustomFetch<{
  data: ITrivia[];
  page: number;
  pages: number;
  total: number;
}>("/trivia/all", {
  query: {
    limit: currentPageSize,
    page: currentPage,
  },
  watch: [currentPage],
  immediate: true,
  onResponseError(context) {
    console.error(context.error);
    showFailToast("Não foi possível carregar as trivias.");
  },
});

async function handleTriviaClick(triviaId: string) {
  // create match
  navigateTo({
    name: "PlayTrivia",
    params: {
      matchId: "c3966564-fbd7-42cb-bab8-7ea053781503",
      triviaId,
    },
  });
}
</script>

<style scoped></style>
