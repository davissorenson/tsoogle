import buildFnHash from "./buildFnHash";
import { Fn, FnHash, FnIndex } from "./types";

const buildFnIndex = (fns: Fn[]): FnIndex =>
  fns.reduce((allFnHashes, fn) => {
    const hash = buildFnHash(fn);
    const fnsForHash = allFnHashes.get(hash);

    if (fnsForHash) {
      allFnHashes.set(hash, [...fnsForHash, fn]);
    } else {
      allFnHashes.set(hash, [fn]);
    }

    return allFnHashes;
  }, new Map<FnHash, Fn[]>() as FnIndex);

export default buildFnIndex;
