import { assert } from "console";
import {
  ArrowFunction,
  FunctionTypeNode,
  KindToNodeMappings,
  Node,
  SyntaxKind,
  TypeAliasDeclaration,
  TypeFormatFlags,
} from "ts-morph";
import { typeChecker } from "./project";

const PARAMETER_NAMES = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const getNthParameterName = (n: number): string => {
  assert(
    n < PARAMETER_NAMES.length,
    `Ran out of variable names. Used all ${PARAMETER_NAMES.length} of them. :c`
  );

  return PARAMETER_NAMES[n];
};

const getTypeText = (node: Node): string =>
  typeChecker.getTypeText(
    node.getType(),
    undefined,
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
      TypeFormatFlags.NoTruncation |
      TypeFormatFlags.UseFullyQualifiedType
  );

const canonizeFnTypeName = (
  fnType: FunctionTypeNode | ArrowFunction
): string => {
  console.log(fnType.getParameters().map((it) => it.getName()));

  fnType
    .getParameters()
    .forEach((param, i) => param.rename(getNthParameterName(i)));

  return getTypeText(fnType);
};

const canonizeTypeName = (
  type: FunctionTypeNode | ArrowFunction | TypeAliasDeclaration
): string => {
  const kind = type.getKind();

  switch (kind) {
    case SyntaxKind.FunctionType:
      return canonizeFnTypeName(
        type as KindToNodeMappings[SyntaxKind.FunctionType]
      );
    case SyntaxKind.ArrowFunction:
      return canonizeFnTypeName(
        type as KindToNodeMappings[SyntaxKind.ArrowFunction]
      );
    case SyntaxKind.TypeAliasDeclaration:
      console.log(type.getChildren().map((it) => it.getKindName()));
      console.log(type.getText());
      const fnType = type.getChildrenOfKind(SyntaxKind.FunctionType)[0];
      return canonizeFnTypeName(fnType);
    default:
      return getTypeText(type);
  }
};

export default canonizeTypeName;
