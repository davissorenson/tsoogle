import { SyntaxKind } from "ts-morph";
import declarationsByKind, {
  getAllDeclarationsOfKind,
  getDeclarationByNameOrThrow,
} from "../utils/declarationsByKind";
import {
  loadConstDeclarations,
  loadFunctionDeclarations,
  loadTypeDeclarations,
} from "./loadDeclarations";

const constDeclarationsFile = loadConstDeclarations();
const typeDeclarationsFile = loadTypeDeclarations();
const functionDeclarationsFile = loadFunctionDeclarations();

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

const constDeclarationsByKind = declarationsByKind(constDeclarationsFile);
const constFnDeclarations = getAllDeclarationsOfKind(
  constDeclarationsByKind,
  SyntaxKind.VariableDeclaration
);

// functions
export const someFunction1A = getDeclarationByNameOrThrow(
  constFnDeclarations,
  "someFunction1A"
);
export const someFunction1B = getDeclarationByNameOrThrow(
  constFnDeclarations,
  "someFunction1B"
);
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
export const fnWithNoBlock = getDeclarationByNameOrThrow(
  constFnDeclarations,
  "fnWithNoBlock"
);
export const fnWithTypeConstraint = getDeclarationByNameOrThrow(
  constFnDeclarations,
  "fnWithTypeConstraint"
);
export const fnWithFnInTypeConstraint = getDeclarationByNameOrThrow(
  constFnDeclarations,
  "fnWithFnInTypeConstraint"
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
