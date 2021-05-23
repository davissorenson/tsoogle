import { AnotherImportedType, SomeImportedType } from "./types";

type SomeInternalType = {
  foo: string;
  bar: number[];
  baz?: AnotherInternalType;
};

type AnotherInternalType = {
  name: string;
};

export function function1A(a: number, b: string): string[] {
  return [a.toString(), b];
}

export function function1B(n: number, m: string): string[] {
  return [n.toString(), m];
}

export function simpleFunction1(a: string[]): string[] {
  return a;
}

export function simpleFunction2(a: string): string {
  return a;
}

export function function2A(
  someStruct: SomeImportedType,
  anotherStruct: AnotherImportedType
): void {
  console.log(someStruct);
  console.log(anotherStruct);
}

export function function2B(
  someStruct: SomeInternalType,
  anotherStruct: AnotherInternalType
): void {
  console.log(someStruct);
  console.log(anotherStruct);
}
