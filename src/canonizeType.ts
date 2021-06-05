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

const fnTypeIsFunctionTypeNode = (fnType: FnType): fnType is FunctionTypeNode =>
  fnType.getKind() === SyntaxKind.FunctionType;

const canonizeFnType = (fnType: FnType, depth: number): string => {
  fnType.getParameters().forEach((param, i): void => {
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
  const propertiesSorted = typeLiteral
    .getProperties()
    .sort((propA, propB) => propA.getName().localeCompare(propB.getName()))
    .reverse()
    .map((it) =>
      ts.factory.createPropertySignature(
        it.compilerNode.modifiers,
        it.getName(),
        it.getQuestionTokenNode()?.compilerNode,
        it.getTypeNode()?.compilerNode
      )
    );

  typeLiteral.getProperties().map((it) =>
    it.transform((traversal) => {
      return propertiesSorted.pop() ?? traversal.currentNode;
    })
  );

  return renderChildrenWithoutWhitespace(typeLiteral, depth);
};

const canonizePropertySignature = (
  propertySignature: PropertySignature,
  depth: number
): string => {
  return renderChildrenWithoutWhitespace(propertySignature, depth);
};

const canonizeSyntaxList = (syntaxList: SyntaxList, depth: number): string => {
  const typesExcludedFromRendering = [SyntaxKind.ExportKeyword];
  const filteredChildren = syntaxList
    .getChildren()
    .filter((it) => !typesExcludedFromRendering.includes(it.getKind()));

  return renderWithoutWhitespace(filteredChildren, depth);
};

// TODO: make generic version of below functions

const renderIdentifier = (identifier: Identifier): string => {
  const typesIncludedInRendering = [
    SyntaxKind.Parameter,
    SyntaxKind.FunctionType,
    SyntaxKind.PropertySignature,
  ];
  const parentsTypes = identifier.getAncestors().map((it) => it.getKind());

  if (R.intersection(typesIncludedInRendering, parentsTypes).length > 0) {
    return identifier.getText();
  }

  return "";
};

const renderSemicolon = (
  semicolon: Node<ts.Token<SyntaxKind.SemicolonToken>>
): string => {
  const typesIncludedInRendering = [SyntaxKind.PropertySignature];
  const parentsTypes = semicolon.getAncestors().map((it) => it.getKind());

  if (R.intersection(typesIncludedInRendering, parentsTypes).length > 0) {
    return semicolon.getText();
  }

  return "";
};

const renderEqualsGreaterThanToken = (
  equalsGreaterThan: Node<ts.Node>
): string => {
  const typesExcludedFromRendering = [SyntaxKind.ArrowFunction];
  const parentsTypes = equalsGreaterThan
    .getAncestors()
    .map((it) => it.getKind());

  if (R.intersection(typesExcludedFromRendering, parentsTypes).length > 0) {
    return "";
  }

  return equalsGreaterThan.getText();
};

const renderColonToken = (colonToken: Node<ts.Node>): string => {
  const typesExcludedFromRendering = [
    SyntaxKind.Parameter,
    SyntaxKind.PropertySignature,
  ];
  const parentsTypes = colonToken.getAncestors().map((it) => it.getKind());

  if (R.intersection(typesExcludedFromRendering, parentsTypes).length === 0) {
    return "=>";
  }

  return colonToken.getText();
};

const canonizeType = (node: Node, depth: number): string => {
  const kind = node.getKind();

  switch (kind) {
    case SyntaxKind.FunctionType:
      return canonizeFnType(
        node as KindToNodeMappings[SyntaxKind.FunctionType],
        depth
      );

    case SyntaxKind.ArrowFunction:
      return canonizeFnType(
        node as KindToNodeMappings[SyntaxKind.ArrowFunction],
        depth
      );

    case SyntaxKind.TupleType:
      return canonizeTupleType(
        node as KindToNodeMappings[SyntaxKind.TupleType],
        depth
      );

    case SyntaxKind.TypeLiteral:
      return canonizeTypeLiteral(
        node as KindToNodeMappings[SyntaxKind.TypeLiteral],
        depth
      );

    case SyntaxKind.PropertySignature:
      return canonizePropertySignature(
        node as KindToNodeMappings[SyntaxKind.PropertySignature],
        depth
      );

    case SyntaxKind.TypeAliasDeclaration:
      return renderChildrenWithoutWhitespace(node, depth);

    case SyntaxKind.SyntaxList:
      return canonizeSyntaxList(
        node as KindToNodeMappings[SyntaxKind.SyntaxList],
        depth
      );

    case SyntaxKind.Parameter:
      return renderChildrenWithoutWhitespace(node, depth);

    case SyntaxKind.Identifier:
      return renderIdentifier(
        node as KindToNodeMappings[SyntaxKind.Identifier]
      );

    case SyntaxKind.SemicolonToken:
      return renderSemicolon(
        node as KindToNodeMappings[SyntaxKind.SemicolonToken]
      );

    case SyntaxKind.EqualsGreaterThanToken:
      return renderEqualsGreaterThanToken(node);

    case SyntaxKind.ColonToken:
      return renderColonToken(node);

    case SyntaxKind.TypeKeyword:
    case SyntaxKind.EqualsToken:
    case SyntaxKind.Block:
      return "";

    case SyntaxKind.OpenParenToken:
    case SyntaxKind.CloseParenToken:
    case SyntaxKind.OpenBracketToken:
    case SyntaxKind.CloseBracketToken:
    case SyntaxKind.OpenBraceToken:
    case SyntaxKind.CloseBraceToken:
    case SyntaxKind.CommaToken:
    case SyntaxKind.ArrayType:
    case SyntaxKind.StringKeyword:
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.VoidKeyword:
    case SyntaxKind.NeverKeyword:
      return node.getText();

    default:
      throw new Error(`Unable to handle node of kind ${node.getKindName()}.`);
    // return removeWhiteSpace(getTypeText(type));
  }
};

const exportedCanonizeType = (type: Node): string => canonizeType(type, 0);

export default exportedCanonizeType;
