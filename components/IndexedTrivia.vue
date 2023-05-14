<template>
  <div :class="`h-[${maxHeight}] max-h-[${maxHeight}]`">
    <van-index-bar
      ref="indexedBarRef"
      :index-list="computedIndexes"
      :sticky-offset-top="100"
      sticky
    >
      <template v-for="group in tableRepresentation">
        <van-index-anchor :index="group.letter">{{
          group.letter
        }}</van-index-anchor>
        <van-cell
          v-if="group.rows"
          v-for="(rows, index) in group.rows"
          :key="index"
          class="rounded-md"
        >
          <template #title>
            <van-space class="items-baseline gap-4" wrap fill>
              <template v-for="row in rows">
                <van-space direction="vertical" :size="-2" fill>
                  <div
                    class="min-w-[100%]"
                    :class="row.revealed ? 'text-green-600 ' : ''"
                  >
                    <strong>{{ row.title }}</strong
                    ><span class="text-xs"
                      >&nbsp;({{ row.title.length }} letras)</span
                    >
                  </div>
                  <div class="w-[20vw] sm:w-[10vw]">
                    <i>{{ row.subTitle }}</i>
                  </div>
                </van-space>
              </template>
            </van-space>
          </template>
        </van-cell>
      </template>
    </van-index-bar>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "nuxt/dist/app/compat/capi";
import { IndexedValues } from "~/utils/lib/States";
import { Collator } from "~/utils/lib/StringCompare";
import { ITriviaColumn } from "~/utils/lib/Trivia";
import { IndexBarInstance } from "vant";
import { ScoredWordData } from "~/utils/lib/Events";

const props = defineProps({
  indexedValues: {
    type: Object as PropType<IndexedValues>,
    required: true,
  },
  columns: {
    type: Array as PropType<Omit<ITriviaColumn, "id">[]>,
    required: true,
  },
  revealedValues: {
    type: Array as PropType<ScoredWordData[]>,
    required: false,
    default: [],
  },
  maxHeight: {
    required: false,
    default: "50vh",
  },
});

defineExpose({
  scrollToValue,
});

const indexedBarRef = ref<IndexBarInstance>();

const computedIndexes = computed(
  () =>
    Object.keys(props.indexedValues).sort(
      Collator.compare
    ) as UppercaseLatinAlphabet[]
);

const tableRepresentation = computed(() =>
  computedIndexes.value
    .map((letter) => {
      const rows = props.indexedValues[letter]?.map((indexed) =>
        props.columns.map((column) => {
          const revealed = props.revealedValues.find(
            (revealed) =>
              revealed.columnIndex === indexed.columnIndex &&
              revealed.valueIndex === indexed.valueIndex
          );

          const maskedTitle = column.values[indexed.valueIndex].value;
          const unmaskedTitle = revealed ? revealed.value : undefined;

          return {
            title: unmaskedTitle ? unmaskedTitle : maskedTitle,
            subTitle: column.label,
            revealed: !!revealed,
          };
        })
      );

      return {
        letter,
        rows,
      };
    })
    .sort((a, b) => Collator.compare(a.letter, b.letter))
);

function scrollToValue(index: UppercaseLatinAlphabet) {
  if (!indexedBarRef.value) return;

  indexedBarRef.value.scrollTo(index);
}
</script>
