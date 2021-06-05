import canonizeType from "./canonizeType";
import { Fn } from "./types";

class FnIndex {
  private map = new Map<string, Fn[]>();

  public constructor(private hashFn: (fn: Fn) => string, fns: Fn[]) {
    fns.map(this.store);
  }

  public store(fn: Fn): void {
    const hash = this.hashFn(fn);
    const fnsForHash = this.map.get(hash);

    this.map.set(hash, [...(fnsForHash ?? []), fn]);
  }

  public get(hash: string): Fn[] | undefined {
    return this.map.get(hash);
  }
}

const buildFnIndex = (fns: Fn[]): FnIndex =>
  new FnIndex((fn) => canonizeType(fn.declaration), fns);

export default buildFnIndex;
