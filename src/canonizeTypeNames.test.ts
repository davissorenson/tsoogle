import canonizeTypeName from "./canonizeTypeName";
import declarationsToFns from "./declarationsToFns";
import loadConstDeclarations from "./loadConstDeclarations";
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
const someFunction1AFnType = someFunction1A.arrowFn;
const someFunction1BFnType = someFunction1B.arrowFn;

describe("canonizeTypeName", () => {
  describe("function types", () => {
    it("should preserve function parameters when they're already correct", () => {
      expect(canonizeTypeName(someFunction1AFnType)).toBe(
        "(a: number, b: string) => string[]"
      );
    });

    it("should rename all function parameters", () => {
      expect(canonizeTypeName(someFunction1BFnType)).toBe(
        "(a: number, b: string) => string[]"
      );
    });
  });
});
