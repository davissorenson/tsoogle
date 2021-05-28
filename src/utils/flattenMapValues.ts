import R from "ramda";

const flattenMapValues = <T>(m: ReadonlyMap<unknown, T[]>): T[] =>
  Array.from(m.values()).flatMap(R.identity);

export default flattenMapValues;
