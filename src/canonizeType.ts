import R from "ramda";
import {
  ArrowFunction,
  FunctionTypeNode,
  Identifier,
  KindToNodeMappings,
  Node,
  PropertySignature,
  SyntaxKind,
  SyntaxList,
  ts,
  TupleTypeNode,
  TypeLiteralNode,
} from "ts-morph";
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

const renderWithoutWhitespace = (ns: Node[], depth: number): string =>
  removeWhiteSpace(ns.map((it) => canonizeType(it, depth)).join(""));

const renderChildrenWithoutWhitespace = (n: Node, depth: number): string =>
  removeWhiteSpace(
    n
      .getChildren()
      .map((it) => canonizeType(it, depth))
      .join("")
  );

type FnType = FunctionTypeNode | ArrowFunction;

const canonizeFnType = (fnType: FnType, depth: number): string => {
  const parameters = fnType.getParameters();

  parameters.forEach((param, i): void => {
    param.rename(getNthParameterName(i, depth));
  });

  return renderChildrenWithoutWhitespace(fnType, depth + 1);
};

const canonizeTupleType = (tupleType: TupleTypeNode, depth: number): string => {
  const members = tupleType.getElements();

  members.map((it) =>
    it.transform((traversal) => {
      const { currentNode } = traversal;

      if (ts.isNamedTupleMember(currentNode)) {
        return currentNode.type;
      }

      return currentNode;
    })
  );

  return renderChildrenWithoutWhitespace(tupleType, depth + 1);
};

const canonizeTypeLiteral = (
  typeLiteral: TypeLiteralNode,
  depth: number
): string => {
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
      originalProp.replaceWithText(sortedProp.getText());
    })
  );

  return renderChildrenWithoutWhitespace(typeLiteral, depth + 1);
};

const canonizeSyntaxList = (syntaxList: SyntaxList, depth: number): string => {
  const typesExcludedFromRendering = [SyntaxKind.ExportKeyword];
  const filteredChildren = syntaxList
    .getChildren()
    .filter((it) => !typesExcludedFromRendering.includes(it.getKind()));

  return renderWithoutWhitespace(filteredChildren, depth + 1);
};

const renderIdentifier = (identifier: Identifier): string => {
  const typesIncludedInRendering = [
    SyntaxKind.Parameter,
    SyntaxKind.FunctionType,
  ];
  const parentsTypes = identifier.getAncestors().map((it) => it.getKind());

  if (R.intersection(typesIncludedInRendering, parentsTypes).length > 0) {
    return identifier.getText();
  }

  return "";
};

const canonizeType = (type: Node, depth: number): string => {
  const kind = type.getKind();

  switch (kind) {
    case SyntaxKind.FunctionType:
      return canonizeFnType(
        type as KindToNodeMappings[SyntaxKind.FunctionType],
        depth
      );

    case SyntaxKind.ArrowFunction:
      return canonizeFnType(
        type as KindToNodeMappings[SyntaxKind.ArrowFunction],
        depth
      );

    case SyntaxKind.TupleType:
      return canonizeTupleType(
        type as KindToNodeMappings[SyntaxKind.TupleType],
        depth
      );

    case SyntaxKind.TypeLiteral:
      return canonizeTypeLiteral(
        type as KindToNodeMappings[SyntaxKind.TypeLiteral],
        depth
      );

    case SyntaxKind.TypeAliasDeclaration:
      return R.join(
        "",
        type.getChildren().map((it) => canonizeType(it, depth + 0))
      );

    case SyntaxKind.SyntaxList:
      return canonizeSyntaxList(
        type as KindToNodeMappings[SyntaxKind.SyntaxList],
        depth
      );

    case SyntaxKind.Parameter:
      return renderChildrenWithoutWhitespace(type, depth);

    case SyntaxKind.Identifier:
      return renderIdentifier(
        type as KindToNodeMappings[SyntaxKind.Identifier]
      );

    case SyntaxKind.SemicolonToken:
    case SyntaxKind.TypeKeyword:
    case SyntaxKind.EqualsToken:
      return "";

    case SyntaxKind.OpenParenToken:
    case SyntaxKind.CloseParenToken:
    case SyntaxKind.OpenBracketToken:
    case SyntaxKind.CloseBracketToken:
    case SyntaxKind.OpenBraceToken:
    case SyntaxKind.CloseBraceToken:
    case SyntaxKind.EqualsGreaterThanToken:
    case SyntaxKind.CommaToken:
    case SyntaxKind.ArrayType:
    case SyntaxKind.ColonToken:
    case SyntaxKind.StringKeyword:
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.PropertySignature:
      return type.getText();

    default:
      throw new Error(`Unable to handle node of kind ${type.getKindName()}.`);
    // return removeWhiteSpace(getTypeText(type));
  }
};

const exportedCanonizeType = (type: Node): string => canonizeType(type, 0);

export default exportedCanonizeType;
