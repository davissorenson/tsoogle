import {
  DeclarationWithMetaData,
  HashAndDeclarationWithMetadata,
} from "./DeclarationIndex";
import DeclarationIndexStorage from "./DeclarationIndexStorage";

const declarationsWithMetadata: DeclarationWithMetaData[] = [
  {
    name: "declaration-1",
    declaration: {} as any,
    originalTypeString: "original-type-string-1",
    lineNo: 42,
    filePath: "file-path-1",
  },
  {
    name: "declaration-2",
    declaration: {} as any,
    originalTypeString: "original-type-string-2",
    lineNo: 1337,
    filePath: "file-path-1",
  },
  {
    name: "declaration-3",
    declaration: {} as any,
    originalTypeString: "original-type-string-3",
    lineNo: 123,
    filePath: "file-path-2",
  },
];

const hashesAndDeclarations: HashAndDeclarationWithMetadata[] = [
  {
    hash: "hash-1",
    declarationWithMetadata: declarationsWithMetadata[0],
  },
  {
    hash: "hash-2",
    declarationWithMetadata: declarationsWithMetadata[1],
  },
  {
    hash: "hash-1",
    declarationWithMetadata: declarationsWithMetadata[2],
  },
];

describe("DeclarationIndexStorage", () => {
  let storage: DeclarationIndexStorage;

  describe("addDeclarations", () => {
    beforeEach(() => {
      storage = new DeclarationIndexStorage();
      storage.addDeclarations(hashesAndDeclarations);
    });

    it("stores declarations in hash to metadata map", () => {
      expect(Array.from(storage.getHashToMetaData().entries())).toEqual([
        ["hash-1", [declarationsWithMetadata[0], declarationsWithMetadata[2]]],
        ["hash-2", [declarationsWithMetadata[1]]],
      ]);
    });

    it("stores hashes in file path to hashes map", () => {
      expect(Array.from(storage.getFilePathToHashes().entries())).toEqual([
        ["file-path-1", ["hash-1", "hash-2"]],
        ["file-path-2", ["hash-1"]],
      ]);
    });
  });
});
