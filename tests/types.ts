export type SomeImportedType = {
  foo: string;
  bar: number[];
  baz?: AnotherImportedType;
};

export type AnotherImportedType = {
  name: string;
};

export type NestedFnType = (
  p: string,
  q: (a: number, b: (r: number, s: string) => void) => number[]
) => never;
