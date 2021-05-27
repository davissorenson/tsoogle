import R from "ramda";
import { Fn } from "./types";

export const getFnByName = (fns: Fn[], name: string): Fn =>
  fns.find((fn) => fn.declaration.getName() === name)!;

export const flattenMapValues = <T>(m: ReadonlyMap<unknown, T[]>): T[] =>
  Array.from(m.values()).flatMap(R.identity);
