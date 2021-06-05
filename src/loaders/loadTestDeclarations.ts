import { SyntaxKind } from "ts-morph";
import declarationsToFns from "../declarationsToFns";
import { ArrowFnAndDeclaration } from "../types";
import declarationsByKind, {
  getAllDeclarationsOfKind,
  getDeclarationByNameOrThrow,
} from "../utils/declarationsByKind";
import { getFnByName } from "../utils/getFnByName";
import {
  loadConstDeclarations,
  loadTypeDeclarations,
} from "./loadDeclarations";

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
const typeDeclarationsByKind = declarationsByKind(typeDeclarations);
const typeAliasDeclarations = getAllDeclarationsOfKind(
  typeDeclarationsByKind,
  SyntaxKind.TypeAliasDeclaration
);

export const someFunction1AFnType = someFunction1A.arrowFn;
export const someFunction1BFnType = someFunction1B.arrowFn;
export const nestedFnType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "NestedFnType"
);
export const fnWithTypeParameter = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "FnWithTypeParameter"
);
export const fnWithMultipleTypeParameters = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "FnWithMultipleTypeParameters"
);
export const unnamedTupleType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "UnnamedTupleType"
);
export const namedTupleType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "NamedTupleType"
);
export const unnamedNestedTupleType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "UnnamedNestedTupleType"
);
export const nestedNamedTupleType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "NestedNamedTupleType"
);
export const objectType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "ObjectType"
);
export const nonAlphabetizedObjectType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "NonAlphabetizedObjectType"
);
export const nestedObjectType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "NestedObjectType"
);
export const fnTypeWithNamedTuple = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "FnTypeWithNamedTuple"
);
export const fnTypeWithNestedNamedTuple = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "FnTypeWithNestedNamedTuple"
);
export const fnTypeWithNestedObjectType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "FnTypeWithNestedObjectType"
);
