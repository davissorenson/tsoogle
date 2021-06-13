import {
  DeclarationWithMetaData,
  HashAndDeclarationWithMetadata,
} from "./DeclarationIndex";

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

  public getHashToMetaData(): Map<string, DeclarationWithMetaData[]> {
    return this.hashToMetadata;
  }

  public getFilePathToHashes(): Map<string, string[]> {
    return this.filePathToHashes;
  }

  // TODO: improve types
  public getEntries(): [string, DeclarationWithMetaData[]][] {
    return Array.from(this.hashToMetadata.entries());
  }
}

export default DeclarationIndexStorage;
