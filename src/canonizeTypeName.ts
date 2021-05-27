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

const getNthParameterName = (n: number, depth: number): string => {
  assert(
    n < PARAMETER_NAMES.length,
    `Ran out of variable names. Used all ${PARAMETER_NAMES.length} of them. :c`
  );

  return `${PARAMETER_NAMES[n]}${depth}`;
};

const removeWhiteSpace = (s: string): string => s.replaceAll(/\s/g, "");

const getTypeText = (node: Node): string =>
  typeChecker.getTypeText(
    node.getType(),
    undefined,
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
      TypeFormatFlags.NoTruncation |
      TypeFormatFlags.UseFullyQualifiedType
  );

type FnType = FunctionTypeNode | ArrowFunction;

const canonizeFnTypeName = (fnType: FnType): string => {
  const inner = (scope: FnType, depth = 0): void => {
    const parameters = scope.getParameters();
    parameters.forEach((param, i): void => {
      param.rename(getNthParameterName(i, depth));
      const fnChildren = param.getChildrenOfKind(SyntaxKind.FunctionType);

      if (fnChildren.length === 1) {
        inner(fnChildren[0], depth + 1);
      }

      if (fnChildren.length > 1) {
        throw new Error(
          `What's going on here? fnChildren has length ${fnChildren.length}`
        );
      }
    });
  };

  inner(fnType);

  return removeWhiteSpace(
    fnType
      .getChildren()
      .map((it) => it.getText())
      .join("")
  );
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
      // console.log(type.getChildren().map((it) => it.getKindName()));
      // console.log(type.getText());
      const fnType = type.getChildrenOfKind(SyntaxKind.FunctionType)[0];
      return canonizeFnTypeName(fnType);
    default:
      return removeWhiteSpace(getTypeText(type));
  }
};

export default canonizeTypeName;
