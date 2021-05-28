import { SyntaxKind } from "@ts-morph/common";
import canonizeType from "./canonizeType";
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
const unnamedTupleType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "UnnamedTupleType"
);
const namedTupleType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "NamedTupleType"
);
const unnamedNestedTupleType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "UnnamedNestedTupleType"
);
const nestedNamedTupleType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "NestedNamedTupleType"
);

describe("canonizeTypeName", () => {
  describe("function types", () => {
    it("should preserve function parameters when they're already correct", () => {
      expect(canonizeType(someFunction1AFnType)).toBe(
        "(a0:number,b0:string)=>string[]"
      );
    });

    it("should rename all function parameters", () => {
      expect(canonizeType(someFunction1BFnType)).toBe(
        "(a0:number,b0:string)=>string[]"
      );
    });

    it("should work with nested function types", () => {
      expect(canonizeType(nestedFnType)).toBe(
        "(a0:string,b0:(a1:number,b1:(a2:number,b2:string)=>void)=>number[])=>never"
      );
    });
  });

  describe("tuple types", () => {
    it("should canonize tuple types", () => {
      expect(canonizeType(unnamedTupleType)).toBe("[string,number]");
    });

    it("should canonize named tuple types as unnamed tuple types", () => {
      expect(canonizeType(namedTupleType)).toBe("[string,number]");
    });

    it("should canonize unnamed nested tuple types", () => {
      expect(canonizeType(unnamedNestedTupleType)).toBe(
        "[string,[number,string[]]]"
      );
    });

    it("should canonize nested named tuple types", () => {
      expect(canonizeType(nestedNamedTupleType)).toBe(
        "[string,[number,string[]]]"
      );
    });
  });
});