export type SomeImportedType = {
  foo: string;
  bar: number[];
  baz?: AnotherImportedType;
};

export type AnotherImportedType = {
  name: string;
};
