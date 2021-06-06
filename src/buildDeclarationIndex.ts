import { ExportedDeclarations } from "ts-morph";
import canonizeType from "./canonizeType";

const declarationsSummary = (declarations: ExportedDeclarations[]): string =>
  declarations
    .map((decl) => `\t${decl.getSymbolOrThrow().getName()}`)
    .join("\n");

class DeclarationIndex<T extends ExportedDeclarations> {
  private map = new Map<string, T[]>();

  public constructor(private hashFn: (item: T) => string, declarations: T[]) {
    declarations.map(this.store.bind(this));
  }

  public store(declaration: T): void {
    const hash = this.hashFn(declaration);
    const declarationsForHash = this.map.get(hash);

    this.map.set(hash, [...(declarationsForHash ?? []), declaration]);
  }

  public get(hash: string): T[] | undefined {
    return this.map.get(hash);
  }

  public getKeys(): string[] {
    return Array.from(this.map.keys());
  }

  public debugSummary(): string {
    return Array.from(this.map.entries())
      .sort(([hashA], [hashB]) => hashA.localeCompare(hashB))
      .map(
        ([hash, declarations]) =>
          `${hash}: ${declarations.length}\n${declarationsSummary(
            declarations
          )}`
      )
      .join("\n");
  }
}

const buildDeclarationIndex = (
  declarations: ExportedDeclarations[]
): DeclarationIndex<ExportedDeclarations> =>
  new DeclarationIndex<ExportedDeclarations>(canonizeType, declarations);

export default buildDeclarationIndex;
