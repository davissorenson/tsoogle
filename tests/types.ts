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

export type FnWithTypeParameter = <T>(something: T) => T;

export type FnWithMultipleTypeParameters = <T, U, V>(
  something: T,
  anotherThing: U
) => V[];

export type SomeType = Array<number>;

export type FnWithTypeParametersWithConstraints = <T extends SomeType>(
  someArg: T
) => T[];

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

export type FnTypeWithNamedTuple = (
  x: string,
  y: [p: number, q: string[]],
  z: number[]
) => [r: string[], s: number[]];

export type FnTypeWithNestedNamedTuple = (
  x: string,
  y: [p: number, q: [t: string, u: number[]]],
  z: number[]
) => [r: string[], s: number[]];

export type FnTypeWithNestedObjectType = (
  y: {
    foo: string;
    bar: {
      qux: {
        b: string[];
        a: number;
      };
      baz: number[];
    };
  },
  x: string[]
) => {
  foo: string;
  bar: {
    qux: {
      b: string[];
      a: number;
    };
    baz: number[];
  };
};
