import { ExportedDeclarations, SourceFile, TypeChecker } from "ts-morph";
import canonizeType from "./canonizeType";
import getOriginalTypeName from "./getOriginalTypeString";

type DeclarationWithName = {
  declaration: ExportedDeclarations;
  name: string;
};

type DeclarationWithMetaData = DeclarationWithName & {
  originalTypeString: string;
  filePath: string;
  lineNo: number;
};

// TODO: try out nominal typing for hash
type HashAndDeclarationWithMetadata = {
  hash: string;
  declarationWithMetadata: DeclarationWithMetaData;
};

const declarationSummary = (decl: DeclarationWithMetaData): string =>
  `\t${decl.name} :: ${decl.originalTypeString}\n\t\t${decl.filePath}:${decl.lineNo}`;

export const declarationsSummary = (
  declarations: DeclarationWithMetaData[]
): string => declarations.map(declarationSummary).join("\n");

class DeclarationIndexStorage {
  /**
   * Map from a hash of a TS type to all declarations that match the hash.
   * Used for storing declarations after extracting them from the project.
   */
  private hashToMetadata = new Map<string, DeclarationWithMetaData[]>();
  /**
   * Map from a file path to all the hashes of declarations in that file.
   * Used for removing declarations when a file gets deleted.
   * @see {@link DeclarationIndexStorage.removeDeclarationsForFilePath}
   */
  private filePathToHashes = new Map<string, string[]>();

  /**
   * Store declarations
   * @param hashesAndDeclarations Hashes and their corresponding declarations
   */
  public addDeclarations(
    hashesAndDeclarations: HashAndDeclarationWithMetadata[]
  ): void {
    hashesAndDeclarations.forEach(({ hash, declarationWithMetadata }) => {
      const existingDeclarations = this.hashToMetadata.get(hash) ?? [];
      this.hashToMetadata.set(hash, [
        ...existingDeclarations,
        declarationWithMetadata,
      ]);

      const existingHashes =
        this.filePathToHashes.get(declarationWithMetadata.filePath) ?? [];
      this.filePathToHashes.set(declarationWithMetadata.filePath, [
        ...existingHashes,
        hash,
      ]);
    });
  }

  /**
   * Remove all declarations defined in a file
   * @param filePath File path being removed
   */
  public removeDeclarationsForFilePath(filePath: string): void {
    /**
     * 1. Get all hashes associated with a file path
     * 2. Get all declarations associated with those hashes
     * 3. Remove all declarations which are defined in that file path
     * 4. Remove the entry from filePathToHashes
     */
    const hashes = this.filePathToHashes.get(filePath) ?? [];
    hashes.forEach((hash) => {
      const allDeclarationsForHash = this.hashToMetadata.get(hash) ?? [];
      // filter out the declarations from this file
      const declarationsInOtherFiles = allDeclarationsForHash.filter(
        (declarationWithMetaData) =>
          declarationWithMetaData.filePath !== filePath
      );

      if (declarationsInOtherFiles.length > 0) {
        this.hashToMetadata.set(hash, declarationsInOtherFiles);
      } else {
        this.hashToMetadata.delete(hash);
      }
    });

    this.filePathToHashes.delete(filePath);
  }

  public searchByHash(hash: string): DeclarationWithMetaData[] {
    return this.hashToMetadata.get(hash) ?? [];
  }

  public searchByFilePath(filePath: string): DeclarationWithMetaData[] {
    const hashes = this.filePathToHashes.get(filePath) ?? [];

    return hashes.flatMap((hash) => {
      const allDeclarationsForHash = this.hashToMetadata.get(hash) ?? [];
      return allDeclarationsForHash.filter(
        (declarationWithMetaData) =>
          declarationWithMetaData.filePath === filePath
      );
    });
  }

  public getKeys(): string[] {
    return Array.from(this.hashToMetadata.keys());
  }

  // TODO: improve types
  public getEntries(): [string, DeclarationWithMetaData[]][] {
    return Array.from(this.hashToMetadata.entries());
  }
}

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
    return this.storage.getKeys();
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
}

export default DeclarationIndex;
