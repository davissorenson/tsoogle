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
  loadFunctionDeclarations,
  loadTypeDeclarations,
} from "./loadDeclarations";

const constDeclarationsFile = loadConstDeclarations();
const typeDeclarationsFile = loadTypeDeclarations();
const functionDeclarationsFile = loadFunctionDeclarations();

const fns = declarationsToFns(constDeclarationsFile);
const someFunction1A = getFnByName(
  fns,
  "someFunction1A"
) as ArrowFnAndDeclaration;
const someFunction1B = getFnByName(
  fns,
  "someFunction1B"
) as ArrowFnAndDeclaration;
const typeDeclarationsByKind = declarationsByKind(typeDeclarationsFile);
const typeAliasDeclarations = getAllDeclarationsOfKind(
  typeDeclarationsByKind,
  SyntaxKind.TypeAliasDeclaration
);

const functionDeclarationsByKind = declarationsByKind(functionDeclarationsFile);
const functionDeclarations = getAllDeclarationsOfKind(
  functionDeclarationsByKind,
  SyntaxKind.FunctionDeclaration
);

// functions
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
export const fnWithTypeParametersWithConstraints = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "FnWithTypeParametersWithConstraints"
);
export const function1A = getDeclarationByNameOrThrow(
  functionDeclarations,
  "function1A"
);
export const function2A = getDeclarationByNameOrThrow(
  functionDeclarations,
  "function2A"
);

// tuples
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

// object types a.k.a. type literals
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
