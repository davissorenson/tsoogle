import declarationsToFns from "./declarationsToFns";
import fnHashFromFn from "./fnHashFromFn";
import loadConstDeclarations from "./loadConstDeclarations";
import { getFnByName } from "./utils";

const constDeclarations = loadConstDeclarations();
const fns = declarationsToFns(constDeclarations);
const someFunction1A = getFnByName(fns, "someFunction1A");
const someFunction1B = getFnByName(fns, "someFunction1B");
const simpleFunction1 = getFnByName(fns, "simpleFunction1");

describe("buildFnHash", () => {
  describe("arrow functions", () => {
    const someFunction1AHash = fnHashFromFn(someFunction1A);
    const someFunction1BHash = fnHashFromFn(someFunction1B);
    const simpleFunction1Hash = fnHashFromFn(simpleFunction1);

    describe("type-equivalent functions are hashed the same", () => {
      it("someFunction1A and someFunction1B", () => {
        expect(someFunction1AHash).toEqual(someFunction1BHash);
      });
    });

    describe("type-incompatible functions are hashed differently", () => {
      it("someFunction1A and simpleFunction1", () => {
        expect(someFunction1AHash).not.toEqual(simpleFunction1Hash);
      });
    });
  });
});
