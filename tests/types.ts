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

export type UnnamedTupleType = [string, number];

export type UnnamedNestedTupleType = [string, [number, string[]]];

export type NamedTupleType = [someName: string, anotherName: number];

export type NestedNamedTupleType = [
  firstElement: string,
  secondElement: [firstNestedElement: number, secondNestedElement: string[]]
];

export type ObjectType = {
  bar: string;
  foo: number[];
};

export type NonAlphabetizedObjectType = {
  foo: number[];
  bar: string;
};

export type NestedObjectType = {
  foo: string;
  bar: {
    qux: {
      b: string[];
      a: number;
    };
    baz: number[];
  };
};
