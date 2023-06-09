<template>
  <van-space direction="vertical" :size="8" fill>
    <h1>Gerenciador de Trivias</h1>
    <van-space class="justify-between" fill>
      <van-button
        size="small"
        :type="showTriviaForm ? 'danger' : 'primary'"
        :icon="showTriviaForm ? 'clear' : 'plus'"
        @click="toggleTriviaForm(!showTriviaForm)"
        >{{ showTriviaForm ? "Cancelar" : "Criar Trivia" }}</van-button
      >
      <van-button
        v-if="showTriviaForm && !triviaCreationCriteria.allCriteriaMet"
        size="small"
        type="danger"
        icon="info"
        @click="showTriviaCreationFailedCriteria"
        >Mostrar Critérios</van-button
      >
    </van-space>

    <van-form
      v-if="showTriviaForm"
      ref="triviaForm"
      :submit-on-enter="false"
      @submit="createTrivia"
    >
      <van-tabs v-model:active="newTrivia.tab" swipeable>
        <van-tab title="Configuração">
          <van-cell-group class="py-2">
            <van-field
              v-model="newTrivia.data.title"
              name="title"
              label="Título"
              label-class="font-bold"
              placeholder="Título da trívia"
              :rules="[{ required: true, message: 'Informe o título.' }]"
              :maxlength="100"
              show-word-limit
            />
            <van-field
              name="columnsAmount"
              label="Colunas"
              label-class="font-bold"
            >
              <template #input>
                <van-stepper
                  v-model="newTrivia.data.columnsAmount"
                  :min="1"
                  :max="4"
                  disable-input
                />
              </template>
            </van-field>

            <van-space class="mt-2 px-4" :size="20" fill>
              <van-button
                type="success"
                size="small"
                icon="plus"
                :loading="pendingCategories"
                @click="toggleCategoryForm(true)"
                >Criar Nova categoria</van-button
              >
              <van-button
                type="primary"
                size="small"
                icon="search"
                :disabled="pendingCategories"
                :loading="pendingCategories"
                @click="toggleCategoryPicker(true)"
                >Selecionar categoria</van-button
              >
              <van-space :size="8" wrap>
                <van-tag
                  v-for="category in newTrivia.data.categories"
                  type="success"
                  size="large"
                  class="cursor-pointer"
                  closeable
                  @click="() => removeCategory(category)"
                  @close="() => removeCategory(category)"
                  >{{ category.name }}</van-tag
                >
              </van-space>
            </van-space>
          </van-cell-group>
        </van-tab>
        <van-tab title="Colunas" :badge="newTrivia.data.columnsAmount">
          <van-space
            :column-num="newTrivia.data.columnsAmount"
            direction="vertical"
            fill
            size="-10px"
          >
            <van-cell-group
              v-for="column in newTrivia.data.columnsAmount"
              :key="column"
              :border="false"
            >
              <van-field
                v-model="newTrivia.data.columns[column - 1].label"
                name="columName"
                label="Nome da coluna"
                label-width="50%"
                label-align="top"
                label-class="font-bold"
                placeholder="nome da coluna"
                :maxlength="100"
                :rules="[{ required: true, message: 'Informe o nome.' }]"
                show-word-limit
                autocapitalize
              />
              <van-cell center title="Valor mascarado?">
                <template #right-icon>
                  <van-switch
                    v-model="newTrivia.data.columns[column - 1].isValueMasked"
                  />
                </template>
              </van-cell>
            </van-cell-group>
          </van-space>
        </van-tab>
        <van-tab title="Preencher">
          <van-cell-group>
            <van-field
              v-for="(column, index) in newTrivia.data.columns"
              :key="column.label + index"
              v-model="newTrivia.rows[index].value"
              label-class="font-bold"
              :id="`field-${index}`"
              :name="column.label"
              :autocomplete="column.label"
              :placeholder="column.label"
              :label="column.label"
              :maxlength="100"
              :rules="[
                {
                  required: !triviaCreationCriteria.allCriteriaMet,
                  message: `Informe a coluna ${column.label}.`,
                },
              ]"
              show-word-limit
            />
          </van-cell-group>
          <van-space direction="vertical" :size="20" fill>
            <div class="mt-2 flex flex-col items-stretch gap-2 sm:flex-row">
              <van-button
                type="primary"
                icon="add"
                class="grow sm:w-80"
                :disabled="disableAddDataBtn"
                @click="addDataToColumns"
                >Adicionar</van-button
              >

              <van-button
                :disabled="!triviaCreationCriteria.allCriteriaMet"
                type="success"
                icon="add"
                native-type="submit"
                class="grow sm:w-80"
                >Criar</van-button
              >
            </div>
            <span> 🤠 {{ questionsAmount }} questões. </span>
            <indexed-trivias
              :indexed-values="indexedValues"
              :columns="newTrivia.data.columns"
            />
          </van-space>
        </van-tab>
      </van-tabs>
    </van-form>
    <van-popup v-model:show="showCategoryPicker" position="center" round>
      <van-picker
        title="Categoria"
        class="min-w-[40vw]"
        :columns="categoryComlumns"
        @cancel="showCategoryPicker = false"
        @confirm="addCategory"
      />
    </van-popup>
    <van-popup v-model:show="showCategoryForm" position="center" round>
      <van-form @submit="createCategory">
        <van-field
          v-model="newCategoryName"
          label="Nome"
          label-class="font-bold"
          placeholder="nome da categoria"
          :rules="[
            {
              required: true,
              message: 'Informe o nome.',
            },
            {
              validator: rules.uniqueCategory,
              message: 'Categoria já existe',
              trigger: 'onBlur',
            },
            {
              validator: (value: string) => value.length >= 3,
              message: 'Deve ter no mínimo 3 letras'

            }
          ]"
          :maxlength="30"
          show-word-limit
        />
        <van-button type="success" native-type="submit" block>
          Criar
        </van-button>
      </van-form>
    </van-popup>
    <paginated-trivia v-if="!showTriviaForm" />
  </van-space>
</template>

<script setup lang="ts">
import { useToggle } from "@vant/use";
import { PickerConfirmEventParams } from "vant";
import { Category } from "~/utils/Lib";
import { Collator } from "~/utils/lib/StringCompare";
import type { FormInstance } from "vant";
import {
  emptyNewTriviaState,
  IndexedValues,
  NewTriviaState,
} from "~/utils/lib/States";
import { useUserStore } from "~/stores/userStore";

useSeoMeta({
  title: "Gerenciador de Trivias",
});
const config = useRuntimeConfig();
const userStore = useUserStore();

const {
  execute: fetchCategories,
  data: categories,
  pending: pendingCategories,
} = useCustomFetch<{ id: string; name: string }[]>("/category", {
  immediate: false,
  onResponseError(context) {
    console.error(context.error);
    showFailToast("Não foi possível carregar as categorias.");
  },
});

const triviaForm = ref<FormInstance | null>(null);

const [showTriviaForm, toggleTriviaForm] = useToggle(false);
const [showCategoryForm, toggleCategoryForm] = useToggle(false);
const [showCategoryPicker, toggleCategoryPicker] = useToggle(false);

const newTrivia: NewTriviaState = reactive(emptyNewTriviaState);
const triviaRequestBody = computed(() => ({
  title: newTrivia.data.title,
  categories: newTrivia.data.categories.map((c) => c.id),
  content: {
    columns: newTrivia.data.columns.map((c) => ({
      ...c,
      values: c.values.map(({ value }) => ({
        value,
      })),
    })),
  },
}));
const questionsAmount = computed(() => newTrivia.data.columns[0].values.length);
const newCategoryName = ref("");

const indexedValues: Ref<IndexedValues> = ref({});

const firstMaskedColumnIndex = computed(() =>
  newTrivia.data.columns.findIndex((col) => col.isValueMasked)
);

const categoryComlumns = computed(() =>
  categories.value?.map((c) => ({ value: c.id, text: c.name }))
);

const disableAddDataBtn = computed(() =>
  newTrivia.rows.some((row) => !row.value || row.value.length < 2)
);

const triviaCreationCriteria = computed(() => {
  const constraints = {
    atLeastOneColumn: newTrivia.data.columns.length >= 1,
    atMostFourColumn: newTrivia.data.columns.length <= 4,
    atLeastOneMaskedColumn: firstMaskedColumnIndex.value > -1,
    atLeastOneCategory: newTrivia.data.categories.length > 0,
    atMostFiveCategories: newTrivia.data.categories.length <= 5,
    atLeastTenRows: newTrivia.data.columns[0].values.length >= 10,
  };

  return {
    constraints,
    allCriteriaMet: Object.values(constraints).every((v) => v === true),
  };
});

watch(
  () => newTrivia.data.columnsAmount,
  (newAmount, oldAmount) => {
    if (newAmount > oldAmount) {
      newTrivia.data.columns.push({
        label: "",
        isValueMasked: true,
        values: [],
      });
      newTrivia.rows.push({ value: "" });

      return;
    }

    newTrivia.data.columns.pop();
    newTrivia.rows.pop();
  }
);

watch(showTriviaForm, async (value) => {
  if (value && !categories.value?.length) {
    const toast = showLoadingToast({
      message: "Carregando categorias",
      wordBreak: "break-word",
      duration: 0,
    });
    await fetchCategories();
    toast.close();
  }
});

const rules = {
  uniqueCategory(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(
        !categories.value?.some(
          (c) => Collator.compare(c.name, newCategoryName.value) === 0
        )
      );
    });
  },
};

// async function handlePaginationChange(params: any) {
//   await refreshTrivias();
// }

function resetTriviaState() {
  newTrivia.data = emptyNewTriviaState.data;
  newTrivia.rows = emptyNewTriviaState.rows;
  newTrivia.selectedCategory = emptyNewTriviaState.selectedCategory;
  newTrivia.tab = emptyNewTriviaState.tab;
}

async function createTrivia() {
  if (!triviaForm.value) return;

  await triviaForm.value.validate();

  try {
    showLoadingToast("Criando trivia");
    await $fetch("/trivia", {
      baseURL: config.public.api,
      method: "POST",
      headers: { Authorization: `Bearer ${userStore.loggedUser.accessToken}` },
      body: triviaRequestBody.value,
    });
    closeToast();
    showNotify({
      type: "success",
      message: "Trivia criada ❤️",
    });

    resetTriviaState();
    toggleTriviaForm(false);
  } catch (error) {
    console.error(error);
    showNotify("Falha ao criar a Trivia");
  }
}

async function createCategory() {
  try {
    showLoadingToast("Criando categoria");
    const response = await $fetch<{ id: string }>("/category", {
      baseURL: config.public.api,
      method: "POST",
      headers: { Authorization: `Bearer ${userStore.loggedUser.accessToken}` },
      body: {
        name: newCategoryName.value,
      },
    });

    categories.value?.push({ id: response.id, name: newCategoryName.value });
    newCategoryName.value = "";

    closeToast();
    toggleCategoryForm(false);
    showNotify({
      type: "success",
      message: "Categoria criada ❤️",
    });
  } catch (error) {
    showNotify({
      type: "danger",
      message: "Erro ao criar categoria",
    });
    console.error(error);
  }
}

function addDataToColumns() {
  const {
    data: { columns },
    rows,
  } = newTrivia;
  rows.forEach((row, index) => {
    const newColumnValue = {
      id: Date.now().toString(),
      value: row.value,
    };

    const valueIndex = columns[index].values.push(newColumnValue) - 1;

    if (index === firstMaskedColumnIndex.value) {
      const firstRowLetter = <UppercaseLatinAlphabet>row.value[0].toUpperCase();
      const indexedValue = indexedValues.value[firstRowLetter];

      if (!indexedValue?.length)
        indexedValues.value[firstRowLetter] = [
          { value: row.value, columnIndex: index, valueIndex },
        ];
      else
        indexedValue.push({ value: row.value, columnIndex: index, valueIndex });

      indexedValue?.sort((a, b) => b.value.localeCompare(a.value));
    }

    row.value = "";
  });

  const field = document.getElementById("field-0");
  if (field) field.focus();
}

function addCategory({ selectedOptions }: PickerConfirmEventParams) {
  newTrivia.selectedCategory = {
    id: <string>selectedOptions[0]?.value,
    name: <string>selectedOptions[0]?.text,
  };

  const categoryIsAdded = newTrivia.data.categories.some(
    (c) => Collator.compare(c.name, newTrivia.selectedCategory.name) === 0
  );
  if (!categoryIsAdded)
    newTrivia.data.categories.push(<Category>newTrivia.selectedCategory);

  toggleCategoryPicker(false);
}

function removeCategory(category: Category) {
  const index = newTrivia.data.categories.findIndex(
    (c) => c.id === category.id
  );

  if (index > -1) newTrivia.data.categories.splice(index, 1);
}

function showTriviaCreationFailedCriteria() {
  type TriviaCriteriaKeys =
    keyof (typeof triviaCreationCriteria)["value"]["constraints"];

  const messages: Record<TriviaCriteriaKeys, string> = {
    atLeastOneColumn: "Deve haver ao menos uma coluna",
    atMostFourColumn: "Deve haver no máximo 4 colunas",
    atLeastOneMaskedColumn: "Deve haver ao menos uma coluna com máscara",
    atLeastOneCategory: "A trivia deve ter ao menos uma categoria",
    atMostFiveCategories: "A trivia deve ter no máximo cinco categorias",
    atLeastTenRows: "A trivia deve ter ao menos 10 campos",
  };

  showDialog({
    message: Object.keys(messages)
      .filter(
        (key) =>
          triviaCreationCriteria.value.constraints[
            key as TriviaCriteriaKeys
          ] === false
      )
      .map((key) => messages[key as TriviaCriteriaKeys])
      .join("\n"),
  });
}
</script>
<style scoped>
@media screen and (max-width: 640px) {
  .van-picker::v-deep(.van-picker__toolbar) {
    width: 90vw;
  }
}
</style>
