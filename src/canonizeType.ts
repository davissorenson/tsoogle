import { assert } from "console";
import {
  ArrowFunction,
  FunctionTypeNode,
  KindToNodeMappings,
  NamedTupleMember,
  Node,
  SyntaxKind,
  TupleTypeNode,
  TypeAliasDeclaration,
  TypeFormatFlags,
} from "ts-morph";
import { typeChecker } from "./project";
import { getChildOfKind } from "./utils/getChildOfKind";

const PARAMETER_NAMES = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const getNthParameterName = (n: number, depth: number): string => {
  assert(
    n < PARAMETER_NAMES.length,
    `Ran out of variable names. Used all ${PARAMETER_NAMES.length} of them. :c`
  );

  return `${PARAMETER_NAMES[n]}${depth}`;
};

const removeWhiteSpace = (s: string): string => s.replaceAll(/\s/g, "");

const renderWithoutWhitespace = (n: Node): string =>
  removeWhiteSpace(
    n
      .getChildren()
      .map((it) => it.getText())
      .join("")
  );

const getTypeText = (node: Node): string =>
  typeChecker.getTypeText(
    node.getType(),
    undefined,
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
      TypeFormatFlags.NoTruncation |
      TypeFormatFlags.UseFullyQualifiedType
  );

type FnType = FunctionTypeNode | ArrowFunction;

const canonizeFnType = (fnType: FnType): string => {
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

  const kind = fnType.getKind();

  if (kind === SyntaxKind.ArrowFunction) {
    return removeWhiteSpace(getTypeText(fnType));
  }

  return renderWithoutWhitespace(fnType);
};

const canonizeTupleType = (tupleType: TupleTypeNode): string => {
  const namedTupleStack: NamedTupleMember[] = [];

  const inner = (scope: TupleTypeNode): void => {
    const members = scope.getElements();
    members.forEach((member) => {
      const kind = member.getKind();
      if (kind === SyntaxKind.NamedTupleMember) {
        namedTupleStack.push(member.asKindOrThrow(kind));
      }

      const nestedTuple = getChildOfKind(member, SyntaxKind.TupleType);

      if (nestedTuple) {
        inner(nestedTuple);
      }
    });
  };

  inner(tupleType);

  namedTupleStack.reverse().forEach((namedTuple) => {
    const name = namedTuple.getName();
    const existingText = removeWhiteSpace(namedTuple.getText());
    namedTuple.replaceWithText(existingText.replace(`${name}:`, ""));
  });

  return renderWithoutWhitespace(tupleType);
};

const canonizeType = (
  type: FunctionTypeNode | ArrowFunction | TypeAliasDeclaration
): string => {
  const kind = type.getKind();

  switch (kind) {
    case SyntaxKind.FunctionType:
      return canonizeFnType(
        type as KindToNodeMappings[SyntaxKind.FunctionType]
      );
    case SyntaxKind.ArrowFunction:
      return canonizeFnType(
        type as KindToNodeMappings[SyntaxKind.ArrowFunction]
      );
    // TODO: replace this flag logic with something recursive
    case SyntaxKind.TypeAliasDeclaration:
      const fnTypes = type.getChildrenOfKind(SyntaxKind.FunctionType);
      const tupleTypes = type.getChildrenOfKind(SyntaxKind.TupleType);

      if (fnTypes.length > 0) {
        return canonizeFnType(fnTypes[0]);
      }

      if (tupleTypes.length > 0) {
        return canonizeTupleType(tupleTypes[0]);
      }

      throw new Error(`Unable to handle node of kind ${type.getKindName()}`);

    default:
      return removeWhiteSpace(getTypeText(type));
  }
};

export default canonizeType;
