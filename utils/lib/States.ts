export interface NewTriviaState {
  tab: number;
  selectedCategory: {
    id: string | null;
    name: string;
  };
  data: {
    title: string;
    columnsAmount: number;
    categories: { id: string; name: string }[];
    columns: {
      label: string;
      isValueMasked: boolean;
      values: { id: string; value: string }[];
    }[];
  };
  rows: { value: string }[];
}

export const emptyNewTriviaState: NewTriviaState = {
  tab: 0,
  selectedCategory: {
    id: null,
    name: "",
  },
  data: {
    title: "",
    columnsAmount: 1,
    categories: [],
    columns: [
      {
        isValueMasked: true,
        label: "",
        values: [],
      },
    ],
  },
  rows: [
    {
      value: "",
    },
  ],
};

export type IndexedValues = Partial<
  Record<
    UppercaseLatinAlphabet,
    Array<{ value: string; columnIndex: number; valueIndex: number }>
  >
>;
