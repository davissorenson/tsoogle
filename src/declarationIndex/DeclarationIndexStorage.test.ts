import {
  DeclarationWithMetaData,
  HashAndDeclarationWithMetadata,
} from "./DeclarationIndex";
import DeclarationIndexStorage from "./DeclarationIndexStorage";

const filePaths = ["file-path-1", "file-path-2"];

const declarationsWithMetadata: DeclarationWithMetaData[] = [
  {
    name: "declaration-1",
    declaration: {} as any,
    originalTypeString: "original-type-string-1",
    lineNo: 42,
    filePath: filePaths[0],
  },
  {
    name: "declaration-2",
    declaration: {} as any,
    originalTypeString: "original-type-string-2",
    lineNo: 1337,
    filePath: filePaths[0],
  },
  {
    name: "declaration-3",
    declaration: {} as any,
    originalTypeString: "original-type-string-3",
    lineNo: 123,
    filePath: filePaths[1],
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

  const setupTest = () => {
    storage = new DeclarationIndexStorage();
    storage.addDeclarations(hashesAndDeclarations);
  };
  const getHashToMetaData = () =>
    Array.from(storage.getHashToMetaData().entries());
  const getFilePathToHashes = () =>
    Array.from(storage.getFilePathToHashes().entries());

  describe("addDeclarations", () => {
    beforeEach(() => {
      setupTest();
    });

    it("stores declarations in hash to metadata map", () => {
      expect(getHashToMetaData()).toEqual([
        ["hash-1", [declarationsWithMetadata[0], declarationsWithMetadata[2]]],
        ["hash-2", [declarationsWithMetadata[1]]],
      ]);
    });

    it("stores hashes in file path to hashes map", () => {
      expect(getFilePathToHashes()).toEqual([
        ["file-path-1", ["hash-1", "hash-2"]],
        ["file-path-2", ["hash-1"]],
      ]);
    });
  });

  describe("removeDeclarationsForFilePath", () => {
    describe(filePaths[0], () => {
      beforeEach(() => {
        setupTest();
        storage.removeDeclarationsForFilePath(filePaths[0]);
      });

      it("removes declarations from hash to metadata map", () => {
        expect(getHashToMetaData()).toEqual([
          ["hash-1", [declarationsWithMetadata[2]]],
        ]);
      });

      it("removes hashes from file path to hashes map", () => {
        expect(getFilePathToHashes()).toEqual([["file-path-2", ["hash-1"]]]);
      });
    });

    describe(filePaths[1], () => {
      beforeEach(() => {
        setupTest();
        storage.removeDeclarationsForFilePath(filePaths[1]);
      });

      it("removes declarations from hash to metadata map", () => {
        expect(getHashToMetaData()).toEqual([
          ["hash-1", [declarationsWithMetadata[0]]],
          ["hash-2", [declarationsWithMetadata[1]]],
        ]);
      });

      it("removes hashes from file path to hashes map", () => {
        expect(getFilePathToHashes()).toEqual([
          ["file-path-1", ["hash-1", "hash-2"]],
        ]);
      });
    });
  });

  describe("searchByFilePath", () => {
    beforeEach(() => {
      setupTest();
    });

    it("finds all declarations for the first test file", () => {
      expect(storage.searchByFilePath(filePaths[0])).toStrictEqual([
        declarationsWithMetadata[0],
        declarationsWithMetadata[1],
      ]);
    });

    it("finds all declarations for the second test file", () => {
      expect(storage.searchByFilePath(filePaths[1])).toStrictEqual([
        declarationsWithMetadata[2],
      ]);
    });
  });
});
