export interface ScoredWordData {
  columnIndex: number;
  valueIndex: number;
  valueId: string;
  value: string;
}

export interface WordAttemptEventReturn {
  scored: boolean;
  scoredWordData?: ScoredWordData;
}
