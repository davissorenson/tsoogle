jest.mock("../canonizeType.ts");

import { mocked } from "ts-jest/utils";
import { Project } from "ts-morph";
import canonizeType from "../canonizeType";
import DeclarationIndex from "./DeclarationIndex";
import DeclarationIndexStorage from "./DeclarationIndexStorage";
import { HashAndDeclarationWithMetadata } from "./types";

mocked(canonizeType).mockImplementation((type) =>
  type.getSymbolOrThrow().getName()
);

const project = new Project({ useInMemoryFileSystem: true });

const sourceFile1 = project.createSourceFile(
  "file1.ts",
  `export type TestType1 = string[];`
);
const sourceFile2 = project.createSourceFile(
  "file2.ts",
  `
export const someFn = () => {
  return "someString";
};`
);

describe("DeclarationIndex", () => {
  let declarationIndex: DeclarationIndex;
  let declarationIndexStorage: DeclarationIndexStorage;
  let addDeclarationsSpy: jest.SpyInstance<
    void,
    [hashesAndDeclarations: HashAndDeclarationWithMetadata[]]
  >;

  const setupTests = () => {
    declarationIndex = new DeclarationIndex(project.getTypeChecker(), [
      sourceFile1,
    ]);
    declarationIndexStorage = declarationIndex.getStorage();
    addDeclarationsSpy = jest.spyOn(declarationIndexStorage, "addDeclarations");
    // declarationIndexStorage.addDeclarations = jest.fn();
  };

  describe("addFiles", () => {
    beforeEach(() => {
      setupTests();
      declarationIndex.addFile(sourceFile2);
    });

    it("calls DeclarationIndexStorage#addDeclarations with the right arguments", () => {
      expect(addDeclarationsSpy).toHaveBeenCalledTimes(1);
      // expect(addDeclarationsSpy).toHaveBeenCalledWith([
      //   {
      //     hash: "blah",
      //     declarationWithMetadata: {},
      //   },
      // ]);
    });
  });
});
