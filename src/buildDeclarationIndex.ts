import { ExportedDeclarations, TypeChecker } from "ts-morph";
import canonizeType from "./canonizeType";
import getOriginalTypeName from "./getOriginalTypeString";

type DeclarationWithMetaData = {
  declaration: ExportedDeclarations;
  name: string;
  originalTypeName: string;
  location: string;
};

const declarationSummary = (decl: DeclarationWithMetaData): string =>
  `\t${decl.name} :: ${decl.originalTypeName}\n\t\t${decl.location}`;

const declarationsSummary = (declarations: DeclarationWithMetaData[]): string =>
  declarations.map(declarationSummary).join("\n");

class DeclarationIndex {
  private map = new Map<string, DeclarationWithMetaData[]>();
  private getOriginalTypeName: ReturnType<typeof getOriginalTypeName>;

  public constructor(
    private hashFn: (item: ExportedDeclarations) => string,
    typeChecker: TypeChecker,
    declarations: ExportedDeclarations[]
  ) {
    this.getOriginalTypeName = getOriginalTypeName(typeChecker);
    declarations.map(this.store.bind(this));
  }

  public store(declaration: ExportedDeclarations): void {
    const originalTypeName = this.getOriginalTypeName(declaration);
    const hash = this.hashFn(declaration);
    const declarationsForHash = this.map.get(hash);

    this.map.set(hash, [
      ...(declarationsForHash ?? []),
      this.buildMetaData(declaration, originalTypeName),
    ]);
  }

  private buildMetaData(
    declaration: ExportedDeclarations,
    originalTypeName: string
  ): DeclarationWithMetaData {
    return {
      declaration,
      name: declaration.getSymbolOrThrow().getName(),
      originalTypeName,
      location: this.buildDeclarationLocation(declaration),
    };
  }

  private buildDeclarationLocation(declaration: ExportedDeclarations): string {
    return `${declaration
      .getSourceFile()
      .getFilePath()}:${declaration.getStartLineNumber()}`;
  }

  public get(hash: string): DeclarationWithMetaData[] | undefined {
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
          `${hash}: ${declarations.length}\n` +
          declarationsSummary(declarations) +
          "\n"
      )
      .join("\n");
  }
}

const buildDeclarationIndex = (
  declarations: ExportedDeclarations[],
  typeChecker: TypeChecker
): DeclarationIndex =>
  new DeclarationIndex(canonizeType, typeChecker, declarations);

export default buildDeclarationIndex;
