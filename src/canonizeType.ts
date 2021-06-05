import R from "ramda";
import {
  ArrowFunction,
  FunctionTypeNode,
  KindToNodeMappings,
  NamedTupleMember,
  Node,
  PropertySignature,
  SyntaxKind,
  TupleTypeNode,
  TypeAliasDeclaration,
  TypeFormatFlags,
  TypeLiteralNode,
} from "ts-morph";
import { typeChecker } from "./project";
import { getChildOfKind } from "./utils/getChildOfKind";

const PARAMETER_NAMES = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const getNthParameterName = (n: number, depth: number): string => {
  console.assert(
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

      const fnChild = getChildOfKind(param, SyntaxKind.FunctionType);

      if (fnChild) {
        inner(fnChild, depth + 1);
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

const canonizeTypeLiteral = (typeLiteral: TypeLiteralNode): string => {
  const typeLiteralStack: R.KeyValuePair<
    PropertySignature,
    PropertySignature
  >[][] = [];

  const inner = (scope: TypeLiteralNode): void => {
    const propertiesUnsorted = scope.getProperties();
    const propertiesSorted = scope
      .getProperties()
      .sort((propA, propB) => propA.getName().localeCompare(propB.getName()));

    typeLiteralStack.push(R.zip(propertiesUnsorted, propertiesSorted));

    propertiesSorted.forEach((prop) => {
      const nestedTypeLiteral = getChildOfKind(prop, SyntaxKind.TypeLiteral);

      if (nestedTypeLiteral) {
        inner(nestedTypeLiteral);
      }
    });
  };

  inner(typeLiteral);

  // idea: rewrite type literal completely?

  typeLiteralStack.reverse().forEach((originalPropAndSortedText) =>
    originalPropAndSortedText.forEach(([originalProp, sortedProp]) => {
      console.log(
        `replacing node "${originalProp.getText()}" with text "${sortedProp.getText()}"`
      );
      originalProp.replaceWithText(sortedProp.getText());
    })
  );

  return renderWithoutWhitespace(typeLiteral);
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
    // TODO: replace this flat logic with something recursive
    case SyntaxKind.TypeAliasDeclaration:
      const fnType = getChildOfKind(type, SyntaxKind.FunctionType);
      const tupleType = getChildOfKind(type, SyntaxKind.TupleType);
      const typeLiteral = getChildOfKind(type, SyntaxKind.TypeLiteral);

      if (fnType) {
        return canonizeFnType(fnType);
      }

      if (tupleType) {
        return canonizeTupleType(tupleType);
      }

      if (typeLiteral) {
        return canonizeTypeLiteral(typeLiteral);
      }

      throw new Error(
        `Unable to handle node of kind ${type.getKindName()}. Children: ${type
          .getChildren()
          .map((it) => it.getKindName())}`
      );

    default:
      return removeWhiteSpace(getTypeText(type));
  }
};

export default canonizeType;
