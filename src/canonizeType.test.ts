import canonizeType from "./canonizeType";
import * as testDeclarations from "./loaders/loadTestDeclarations";

describe("canonizeTypeName", () => {
  describe("function types", () => {
    it("should preserve function parameters when they're already correct", () => {
      expect(canonizeType(testDeclarations.someFunction1AFnType)).toBe(
        "(a0:number,b0:string)=>string[]"
      );
    });

    it("should rename all function parameters", () => {
      expect(canonizeType(testDeclarations.someFunction1BFnType)).toBe(
        "(a0:number,b0:string)=>string[]"
      );
    });

    it("should work with nested function types", () => {
      expect(canonizeType(testDeclarations.nestedFnType)).toBe(
        "(a0:string,b0:(a1:number,b1:(a2:number,b2:string)=>void)=>number[])=>never"
      );
    });

    it("should work with exported function declarations", () => {
      expect(canonizeType(testDeclarations.function1A)).toBe(
        "(a0:number,b0:string)=>string[]"
      );
    });

    it("should not use import types for function parameter types", () => {
      expect(canonizeType(testDeclarations.function2A)).toBe(
        "(a0:SomeImportedType,b0:AnotherImportedType)=>void"
      );
    });

    describe("functions with type parameters", () => {
      it("should canonize functions with one type parameter", () => {
        expect(canonizeType(testDeclarations.fnWithTypeParameter)).toBe(
          "<A0>(a0:A0)=>A0"
        );
      });

      it("should canonize functions with multiple type parameters", () => {
        expect(
          canonizeType(testDeclarations.fnWithMultipleTypeParameters)
        ).toBe("<A0,B0,C0>(a0:A0,b0:B0)=>C0[]");
      });

      it("should canonize functions with type parameters which have constraints", () => {
        expect(
          canonizeType(testDeclarations.fnWithTypeParametersWithConstraints)
        ).toBe("<A0 extends SomeType>(a0:A0)=>A0[]");
      });
    });
  });

  describe("tuple types", () => {
    it("should canonize tuple types", () => {
      expect(canonizeType(testDeclarations.unnamedTupleType)).toBe(
        "[string,number]"
      );
    });

    it("should canonize named tuple types as unnamed tuple types", () => {
      expect(canonizeType(testDeclarations.namedTupleType)).toBe(
        "[string,number]"
      );
    });

    it("should canonize unnamed nested tuple types", () => {
      expect(canonizeType(testDeclarations.unnamedNestedTupleType)).toBe(
        "[string,[number,string[]]]"
      );
    });

    it("should canonize nested named tuple types", () => {
      expect(canonizeType(testDeclarations.nestedNamedTupleType)).toBe(
        "[string,[number,string[]]]"
      );
    });
  });

  describe("object types", () => {
    it("should canonize an object type", () => {
      expect(canonizeType(testDeclarations.objectType)).toBe(
        "{bar:string;foo:number[];}"
      );
    });

    it("should alphabetize an object type's properties", () => {
      expect(canonizeType(testDeclarations.nonAlphabetizedObjectType)).toBe(
        "{bar:string;foo:number[];}"
      );
    });

    it("should canonize nested object types", () => {
      expect(canonizeType(testDeclarations.nestedObjectType)).toBe(
        "{bar:{baz:number[];qux:{a:number;b:string[];};};foo:string;}"
      );
    });
  });

  describe("mixed types", () => {
    it("should anonymize a named tuple within a function type", () => {
      expect(canonizeType(testDeclarations.fnTypeWithNamedTuple)).toBe(
        "(a0:string,b0:[number,string[]],c0:number[])=>[string[],number[]]"
      );
    });

    it("should anonymize a nested named tuple within a function type", () => {
      expect(canonizeType(testDeclarations.fnTypeWithNestedNamedTuple)).toBe(
        "(a0:string,b0:[number,[string,number[]]],c0:number[])=>[string[],number[]]"
      );
    });

    it("should normalize a nested object type within a function type", () => {
      expect(canonizeType(testDeclarations.fnTypeWithNestedObjectType)).toBe(
        "(a0:{bar:{baz:number[];qux:{a:number;b:string[];};};foo:string;},b0:string[])=>{bar:{baz:number[];qux:{a:number;b:string[];};};foo:string;}"
      );
    });
  });
});
