import fnHashFromFn from "./fnHashFromFn";
import { Fn, FnHash, FnIndex } from "./types";

const buildFnIndex = (fns: Fn[]): FnIndex =>
  fns.reduce((allFnHashes, fn) => {
    const hash = fnHashFromFn(fn);
    const fnsForHash = allFnHashes.get(hash);

    if (fnsForHash) {
      allFnHashes.set(hash, [...fnsForHash, fn]);
    } else {
      allFnHashes.set(hash, [fn]);
    }

    return allFnHashes;
  }, new Map<FnHash, Fn[]>());

export default buildFnIndex;
