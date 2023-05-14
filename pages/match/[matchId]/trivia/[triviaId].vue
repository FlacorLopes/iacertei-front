<template>
  <Title>Trivia - {{ trivia?.title }}</Title>

  <van-space size="2vh" direction="vertical" fill>
    <h1 class="text-center text-xl font-bold sm:text-left">
      📚 {{ trivia?.title }}
    </h1>

    <van-sticky offset-top="5vh" ref="sticky">
      <van-cell-group class="shadow-md shadow-black" :border="false" inset>
        <van-field
          v-model="dumbInput"
          label-align="center"
          size="large"
          clear-trigger="always"
          enterkeyhint="send"
          ref="fieldRef"
          :placeholder="trivia?.title"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          autofocus
          clearable
        />
        <div
          v-if="progress > 0"
          class="h-1 bg-red-500"
          :style="{ width: `${progress}%` }"
        ></div>
      </van-cell-group>
      <div class="py-2 text-center text-gray-500">
        <span
          >{{ revealedValues.length }} acertos de
          {{ trivia?.content[0].values.length }}</span
        >
      </div>
    </van-sticky>
    <indexed-trivia
      v-if="trivia"
      ref="indexedTriviaRef"
      :indexed-values="triviasInAlphabeticalOrder"
      :columns="trivia.content"
      :revealed-values="revealedValues"
    />
    <VanBackTop />
  </van-space>
</template>

<script setup lang="ts">
import { Sticky, FieldInstance } from "vant";
import { IndexedValues } from "~/utils/lib/States";
import { ITrivia } from "~/utils/lib/Trivia";
import { useSocketIO } from "~/composables/useSocketIO";
import { ScoredWordData, WordAttemptEventReturn } from "~/utils/lib/Events";
import IndexedTrivia from "~/components/IndexedTrivia.vue";
import { areStringsEqual } from "~/utils/lib/StringCompare";

definePageMeta({
  name: "PlayTrivia",
});

const TOTAL_PROGRESS = 100;
const PROGRESS_DECREASE_AMOUNT = 1;
const INTERVAL_TIME_MS = 5;
const TIMEOUT_TIME_MS = 500;

const route = useRoute();
const { data: trivia } = useCustomFetch<ITrivia>(
  `/trivia/${route.params.triviaId}`,
  {
    onResponseError({ error }) {
      console.error("Error fetching trivia", error);
    },
  }
);
const revealedValues = ref<ScoredWordData[]>([]);
const incorrectAttempts = ref<string[]>([]);

const setConnectionStatus = inject<(s: boolean) => void>(
  "setConnectionStatus"
) as (s: boolean) => void;

const { connect, state, socket } = useSocketIO({
  onStatusChange: setConnectionStatus,
});

const dumbInput = ref("");
const fieldRef = ref<FieldInstance | null>(null);
const innerInput = ref<InstanceType<typeof HTMLInputElement>>();
const indexedTriviaRef = ref<InstanceType<typeof IndexedTrivia>>();

const progress = ref(0);
const timeoutId = ref<ReturnType<typeof setTimeout> | null>(null);
const intervalId = ref<ReturnType<typeof setInterval> | null>(null);

const sticky = ref<InstanceType<typeof Sticky> | null>(null);

const triviasInAlphabeticalOrder: ComputedRef<IndexedValues> = computed(() => {
  if (!trivia.value?.content) return {};

  const indexedValues: IndexedValues = {};

  trivia.value.content.forEach((column, columnIndex) => {
    if (column.isValueMasked)
      column.values.forEach((value, valueIndex) => {
        const firstLetter =
          value.value[0].toUpperCase() as UppercaseLatinAlphabet;

        if (!indexedValues[firstLetter]?.length)
          indexedValues[firstLetter] = [];

        indexedValues[firstLetter]!.push({
          columnIndex,
          valueIndex,
          value: value.value,
        });
      });
  });

  return indexedValues;
});

watch(fieldRef, (field) => bindListenerToInput(field));
// watch(innerInput, (input) => addFocusToInputOnBodyClick(input));

onMounted(() => {
  connect();
});

function bindListenerToInput(field: FieldInstance | null) {
  if (field && !innerInput.value) {
    const input = (<HTMLElement>field.$el).getElementsByTagName("input")[0];

    innerInput.value = input;
    innerInput.value.addEventListener("input", (e) => handleInput(e));
  }
}

function addFocusToInputOnBodyClick(input: HTMLInputElement | undefined) {
  const dataAttr = "data-focus-enabled";
  if (!input || input.getAttribute(dataAttr)) return;

  window.document.body.addEventListener("click", () => {
    input.focus();
  });
  input.setAttribute(dataAttr, "true");
}

function dismissKeyboard() {
  innerInput.value?.blur();
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const word = target.value.trim();

  // Clear any existing timeout and interval
  clearTimeout(timeoutId.value!);
  clearInterval(intervalId.value!);

  if (word.length == 0) {
    progress.value = 0;
    return;
  }

  const wordAlreadyIncorrect = incorrectAttempts.value.some((incorrect) =>
    areStringsEqual(word, incorrect)
  );
  if (wordAlreadyIncorrect && innerInput.value) {
    innerInput.value.style.color = "orange";
    progress.value = 0;
    return;
  } else if (innerInput.value) innerInput.value.style.removeProperty("color");

  const wordHaveBeenScored = revealedValues.value.some((revealed) =>
    areStringsEqual(word, revealed.value)
  );

  if (wordHaveBeenScored) {
    if (innerInput.value) innerInput.value.style.color = "green";
    progress.value = 0;
    return;
  } else if (innerInput.value) innerInput.value.style.removeProperty("color");

  progress.value = TOTAL_PROGRESS;

  // Start new timeout to start progress bar decrease
  timeoutId.value = setTimeout(() => {
    intervalId.value = setInterval(() => {
      progress.value -= PROGRESS_DECREASE_AMOUNT;
      if (progress.value === 0 && !wordHaveBeenScored) {
        clearInterval(intervalId.value!);

        // Send WebSocket message to server
        socket.value?.emit(
          "wordAttempt",
          { word: word, triviaId: trivia.value?.id },
          (data: WordAttemptEventReturn) => {
            if (data.scored) {
              target.value = "";
              dumbInput.value = "";
              revealedValues.value.push(data.scoredWordData!);

              dismissKeyboard();

              showSuccessToast({
                message: `${data.scoredWordData?.value} 🎉`,
                type: "success",
                position: "middle",
                wordBreak: "break-word",
                duration: 2000,
                className: "bg-red-500",
              });

              if ("vibrate" in navigator) {
                navigator.vibrate(500);
              }

              setTimeout(() => innerInput.value?.focus(), 3000);

              if (indexedTriviaRef.value) {
                const firstLetter = word
                  .charAt(0)
                  .toUpperCase() as UppercaseLatinAlphabet;
                indexedTriviaRef.value.scrollToValue(firstLetter);
              }
            } else {
              incorrectAttempts.value.push(innerInput.value?.value!);
              innerInput.value?.classList.add("shake-input");
              if ("vibrate" in navigator) {
                navigator.vibrate([100, 100, 10, 80, 100]);
              }

              setTimeout(
                () => innerInput.value?.classList.remove("shake-input"),
                1000
              );
            }
          }
        );
      }
    }, INTERVAL_TIME_MS); // Update interval time in milliseconds
  }, TIMEOUT_TIME_MS); // Delay time in milliseconds
}
</script>
<style>
:root:root {
  --van-toast-text-color: #84cc16;
  --van-index-bar-index-font-size: 16px;
  --van-index-bar-index-line-height: var(--van-line-height-xl);
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-10px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}

.shake-input {
  animation-name: shake;
  animation-duration: 0.8s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: 1;
}
</style>
