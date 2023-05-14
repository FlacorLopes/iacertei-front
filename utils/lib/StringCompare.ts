const Collator = new Intl.Collator("pt-br", {
  ignorePunctuation: true,
  sensitivity: "base",
  usage: "sort",
});

function areStringsEqual(a: string, b: string): boolean {
  return Collator.compare(a, b) === 0;
}

export { Collator, areStringsEqual };
