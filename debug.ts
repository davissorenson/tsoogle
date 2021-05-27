import { SyntaxKind } from "@ts-morph/common";
import canonizeTypeName from "./src/canonizeTypeName";
import {
  loadConstDeclarations,
  loadTypeDeclarations,
} from "./src/loaders/loadDeclarations";
import declarationsByKind, {
  getAllDeclarationsOfKind,
  getDeclarationByNameOrThrow,
} from "./src/utils/declarationsByKind";

const typeDeclarations = loadTypeDeclarations();

const typeDeclarationsByKind = declarationsByKind(typeDeclarations);
const typeAliasDeclarations = getAllDeclarationsOfKind(
  typeDeclarationsByKind,
  SyntaxKind.TypeAliasDeclaration
);
const nestedFnType = getDeclarationByNameOrThrow(
  typeAliasDeclarations,
  "NestedFnType"
);

console.log(canonizeTypeName(nestedFnType));
