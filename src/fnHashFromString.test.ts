import declarationsToFns from "./declarationsToFns";
import fnHashFromFn from "./fnHashFromFn";
import fnHashFromString from "./fnHashFromString";
import loadConstDeclarations from "./loadConstDeclarations";
import { getFnByName } from "./utils";

const constDeclarations = loadConstDeclarations();
const fns = declarationsToFns(constDeclarations);
const someFunction1A = getFnByName(fns, "someFunction1A");
// const someFunction1B = getFnByName(fns, "someFunction1B");
// const simpleFunction1 = getFnByName(fns, "simpleFunction1");

describe("fnHashFromString", () => {
  describe("someFunction1A :: number -> string -> [string]", () => {
    it("something", () => {
      expect(true).toBeTruthy();
    });

    it("matches the type with the same variable names (someFunction1A)", () => {
      const hashFromString = fnHashFromString(
        "(a: number, b: string) => string[]"
      );

      const someFunction1AHash = fnHashFromFn(someFunction1A);
      console.log(someFunction1AHash.parameterTypes[0]);

      expect(hashFromString).toEqual(someFunction1AHash);
    });
  });
});
