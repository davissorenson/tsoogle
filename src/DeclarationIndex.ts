import { ExportedDeclarations, SourceFile, TypeChecker } from "ts-morph";
import canonizeType from "./canonizeType";
import getOriginalTypeName from "./getOriginalTypeString";

type DeclarationWithName = {
  declaration: ExportedDeclarations;
  name: string;
};

type DeclarationWithMetaData = DeclarationWithName & {
  originalTypeString: string;
  location: string;
};

const declarationSummary = (decl: DeclarationWithMetaData): string =>
  `\t${decl.name} :: ${decl.originalTypeString}\n\t\t${decl.location}`;

export const declarationsSummary = (
  declarations: DeclarationWithMetaData[]
): string => declarations.map(declarationSummary).join("\n");

class DeclarationIndex {
  private map = new Map<string, DeclarationWithMetaData[]>();
  private getOriginalTypeName: ReturnType<typeof getOriginalTypeName>;

  public constructor(typeChecker: TypeChecker, sourceFiles: SourceFile[]) {
    const declarations = this.getDeclarationsFromSourceFiles(sourceFiles);
    this.getOriginalTypeName = getOriginalTypeName(typeChecker);
    declarations.map(this.storeDeclarationWithName.bind(this));
  }

  public store(declaration: ExportedDeclarations): void {
    throw new Error(
      `Could not store ${declaration
        .getSymbolOrThrow()
        .getName()}, method not yet implemented`
    );
  }

  public search(hash: string): DeclarationWithMetaData[] {
    return this.map.get(hash) ?? [];
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

  private storeDeclarationWithName(
    declarationWithName: DeclarationWithName
  ): void {
    const { declaration, name } = declarationWithName;
    const originalTypeString = this.getOriginalTypeName(declaration);
    const hash = canonizeType(declaration);
    const declarationsForHash = this.map.get(hash);

    this.map.set(hash, [
      ...(declarationsForHash ?? []),
      this.buildMetaData(declaration, name, originalTypeString),
    ]);
  }

  private getDeclarationsFromSourceFiles(
    sourceFiles: SourceFile[]
  ): DeclarationWithName[] {
    const nameAndDeclarations = sourceFiles.flatMap((it) =>
      Array.from(it.getExportedDeclarations())
    );
    return nameAndDeclarations.flatMap(([name, declarations]) =>
      declarations.map((declaration) => ({
        name,
        declaration,
      }))
    );
  }

  private buildMetaData(
    declaration: ExportedDeclarations,
    name: string,
    originalTypeString: string
  ): DeclarationWithMetaData {
    return {
      declaration,
      name,
      originalTypeString,
      location: this.buildDeclarationLocation(declaration),
    };
  }

  private buildDeclarationLocation(declaration: ExportedDeclarations): string {
    return `${declaration
      .getSourceFile()
      .getFilePath()}:${declaration.getStartLineNumber()}`;
  }
}

export default DeclarationIndex;
