import { ExportedDeclarations, SourceFile, TypeChecker } from "ts-morph";
import canonizeType from "../canonizeType";
import getOriginalTypeName from "../getOriginalTypeString";
import DeclarationIndexStorage from "./DeclarationIndexStorage";
import {
  DeclarationWithMetaData,
  DeclarationWithName,
  HashAndDeclarationWithMetadata,
} from "./types";

const declarationSummary = (decl: DeclarationWithMetaData): string =>
  `\t${decl.name} :: ${decl.originalTypeString}\n\t\t${decl.filePath}:${decl.lineNo}`;

export const declarationsSummary = (
  declarations: DeclarationWithMetaData[]
): string => declarations.map(declarationSummary).join("\n");

class DeclarationIndex {
  private storage = new DeclarationIndexStorage();

  private getOriginalTypeName: ReturnType<typeof getOriginalTypeName>;

  public constructor(typeChecker: TypeChecker, sourceFiles: SourceFile[]) {
    this.getOriginalTypeName = getOriginalTypeName(typeChecker);
    this.addFiles(sourceFiles);
  }

  public updateFile(sourceFile: SourceFile): void {
    this.removeFile(sourceFile);
    this.addFile(sourceFile);
  }

  public addFile(sourceFile: SourceFile): void {
    this.addFiles([sourceFile]);
  }

  public addFiles(sourceFiles: SourceFile[]): void {
    const declarations = this.getDeclarationsFromSourceFiles(sourceFiles);
    this.storeDeclarationsWithNames(declarations);
  }

  private fileIsString(file: string | SourceFile): file is string {
    return typeof file === "string";
  }

  public removeFile(file: SourceFile): void;
  public removeFile(file: string): void;
  public removeFile(file: string | SourceFile): void {
    const filePath = this.fileIsString(file) ? file : file.getFilePath();

    this.storage.removeDeclarationsForFilePath(filePath);
  }

  public storeDeclaration(declaration: ExportedDeclarations): void {
    throw new Error(
      `Could not store ${declaration
        .getSymbolOrThrow()
        .getName()}, method not yet implemented`
    );
  }

  public searchByHash(hash: string): DeclarationWithMetaData[] {
    return this.storage.searchByHash(hash);
  }

  public searchByFilePath(filePath: string): DeclarationWithMetaData[] {
    return this.storage.searchByFilePath(filePath);
  }

  public getKeys(): string[] {
    return Array.from(this.storage.getHashToMetaData().keys());
  }

  public debugSummary(): string {
    return this.storage
      .getEntries()
      .sort(([hashA], [hashB]) => hashA.localeCompare(hashB))
      .map(
        ([hash, declarations]) =>
          `${hash}: ${declarations.length}\n` +
          declarationsSummary(declarations) +
          "\n"
      )
      .join("\n");
  }

  private storeDeclarationsWithNames(
    declarationsWithNames: DeclarationWithName[]
  ): void {
    const hashesAndDeclarations: HashAndDeclarationWithMetadata[] =
      declarationsWithNames.map(({ declaration, name }) => {
        const originalTypeString = this.getOriginalTypeName(declaration);
        const hash = canonizeType(declaration);

        return {
          hash,
          declarationWithMetadata: this.buildMetaData(
            declaration,
            name,
            originalTypeString
          ),
        };
      });

    this.storage.addDeclarations(hashesAndDeclarations);
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
      filePath: declaration.getSourceFile().getFilePath(),
      lineNo: declaration.getStartLineNumber(),
    };
  }

  public getStorage() {
    return this.storage;
  }
}

export default DeclarationIndex;
