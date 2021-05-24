import { Fn } from "./types";

export const getFnByName = (fns: Fn[], name: string): Fn =>
  fns.find((fn) => fn.declaration.getName() === name)!;
