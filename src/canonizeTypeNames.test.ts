import { SyntaxKind } from "@ts-morph/common";
import canonizeTypeName from "./canonizeTypeName";
import declarationsToFns from "./declarationsToFns";
import {
  loadConstDeclarations,
  loadTypeDeclarations,
} from "./loaders/loadDeclarations";
import { ArrowFnAndDeclaration } from "./types";
import { getFnByName } from "./utils";
import declarationsByKind, {
  getAllDeclarationsOfKind,
  getDeclarationByNameOrThrow,
} from "./utils/declarationsByKind";

const constDeclarations = loadConstDeclarations();
const typeDeclarations = loadTypeDeclarations();
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

const typeDeclarationsByKind = declarationsByKind(typeDeclarations);
const typeAliasDeclarations = getAllDeclarationsOfKind(
  typeDeclarationsByKind,
  SyntaxKind.TypeAliasDeclaration
);
const nestedFnType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "NestedFnType"
);

describe("canonizeTypeName", () => {
  describe("function types", () => {
    it("should preserve function parameters when they're already correct", () => {
      expect(canonizeTypeName(someFunction1AFnType)).toBe(
        "(a0:number,b0:string)=>string[]"
      );
    });

    it("should rename all function parameters", () => {
      expect(canonizeTypeName(someFunction1BFnType)).toBe(
        "(a0:number,b0:string)=>string[]"
      );
    });

    it("should work with nested function types", () => {
      expect(canonizeTypeName(nestedFnType)).toBe(
        "(a0:string,b0:(a1:number,b1:(a2:number,b2:string)=>void)=>number[])=>never"
      );
    });
  });
});
