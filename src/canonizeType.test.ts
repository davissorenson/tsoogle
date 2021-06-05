import { SyntaxKind } from "@ts-morph/common";
import canonizeType from "./canonizeType";
import declarationsToFns from "./declarationsToFns";
import {
  loadConstDeclarations,
  loadTypeDeclarations,
} from "./loaders/loadDeclarations";
import { ArrowFnAndDeclaration } from "./types";
import declarationsByKind, {
  getAllDeclarationsOfKind,
  getDeclarationByNameOrThrow,
} from "./utils/declarationsByKind";
import { getFnByName } from "./utils/getFnByName";

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
const objectType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "ObjectType"
);
const nonAlphabetizedObjectType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "NonAlphabetizedObjectType"
);
const nestedObjectType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "NestedObjectType"
);
const fnTypeWithNamedTuple = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "FnTypeWithNamedTuple"
);
const fnTypeWithNestedNamedTuple = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "FnTypeWithNestedNamedTuple"
);
const fnTypeWithNestedObjectType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "FnTypeWithNestedObjectType"
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

  describe("object types", () => {
    it("should canonize an object type", () => {
      expect(canonizeType(objectType)).toBe("{bar:string;foo:number[];}");
    });

    it("should alphabetize an object type's properties", () => {
      expect(canonizeType(nonAlphabetizedObjectType)).toBe(
        "{bar:string;foo:number[];}"
      );
    });

    it("should canonize nested object types", () => {
      expect(canonizeType(nestedObjectType)).toBe(
        "{bar:{baz:number[];qux:{a:number;b:string[];};};foo:string;}"
      );
    });
  });

  describe("mixed types", () => {
    it("should anonymize a named tuple within a function type", () => {
      expect(canonizeType(fnTypeWithNamedTuple)).toBe(
        "(a0:string,b0:[number,string[]],c0:number[])=>[string[],number[]]"
      );
    });

    it("should anonymize a nested named tuple within a function type", () => {
      expect(canonizeType(fnTypeWithNestedNamedTuple)).toBe(
        "(a0:string,b0:[number,[string,number[]]],c0:number[])=>[string[],number[]]"
      );
    });

    it("should normalize a nested object type within a function type", () => {
      expect(canonizeType(fnTypeWithNestedObjectType)).toBe(
        "(a0:{bar:{baz:number[];qux:{a:number;b:string[];};};foo:string;},b0:string[])=>{bar:{baz:number[];qux:{a:number;b:string[];};};foo:string;}"
      );
    });
  });
});
