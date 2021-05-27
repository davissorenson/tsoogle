import { AnotherImportedType, SomeImportedType } from "./types";

type SomeInternalType = {
  foo: string;
  bar: number[];
  baz?: AnotherInternalType;
};

type AnotherInternalType = {
  name: string;
};

export const someFunction1A = (a0: number, b0: string): string[] => {
  return [a0.toString(), b0];
};

export const someFunction1B = (n: number, m: string): string[] => {
  return [n.toString(), m];
};

export const higherOrderFunction1 = (a: string) => (b: string) => {
  return `${a}${b}`;
};

export const simpleFunction1 = (a: string): string => {
  return a;
};

export const function2A = (
  someStruct: SomeImportedType,
  anotherStruct: AnotherImportedType
): void => {
  console.log(someStruct);
  console.log(anotherStruct);
};

export const function2B = (
  someStruct: SomeInternalType,
  anotherStruct: AnotherInternalType
): void => {
  console.log(someStruct);
  console.log(anotherStruct);
};

export const notAFunction = 123;
