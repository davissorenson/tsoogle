import declarationsToFns from "./declarationsToFns";
import loadConstDeclarations from "./loadConstDeclarations";
import mutuallyAssignable from "./mutuallyAssignable";
import { ArrowFnAndDeclaration } from "./types";
import { getFnByName } from "./utils";

const constDeclarations = loadConstDeclarations();
const fns = declarationsToFns(constDeclarations);
const someFunction1A = getFnByName(
  fns,
  "someFunction1A"
) as ArrowFnAndDeclaration;
const someFunction1B = getFnByName(
  fns,
  "someFunction1B"
) as ArrowFnAndDeclaration;

const numberType = someFunction1A.arrowFn.getParameterOrThrow("a").getType();
const stringType = someFunction1A.arrowFn.getParameterOrThrow("b").getType();

describe("mutuallyAssignable", () => {
  describe("simple type", () => {
    it("string is assignable to string", () => {
      expect(mutuallyAssignable(numberType, numberType)).toBeTruthy();
    });

    it("number is not assignable to string", () => {
      expect(mutuallyAssignable(numberType, stringType)).toBeFalsy();
    });
  });

  describe("function types", () => {
    it("(a: number, b: string) => string[] is assignable to (n: number, m: string) => string[]", () => {
      expect(
        mutuallyAssignable(
          someFunction1A.arrowFn.getType(),
          someFunction1B.arrowFn.getType()
        )
      ).toBeTruthy();
    });
  });
});
