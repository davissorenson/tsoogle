import R from "ramda";
import {
  ArrowFunction,
  FunctionDeclaration,
  FunctionTypeNode,
  KindToNodeMappings,
  Node,
  PropertySignature,
  SyntaxKind,
  SyntaxList,
  ts,
  TupleTypeNode,
  TypeLiteralNode,
  TypeParameterDeclaration,
} from "ts-morph";

const PARAMETER_NAMES = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const TYPE_PARAMETER_NAMES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const getNthParameterName = (n: number, depth: number): string => {
  console.assert(
    n < PARAMETER_NAMES.length,
    `Ran out of variable names. Used all ${PARAMETER_NAMES.length} of them. :c`
  );

  return `${PARAMETER_NAMES[n]}${depth}`;
};

const getNthTypeParameterName = (n: number, depth: number): string => {
  console.assert(
    n < TYPE_PARAMETER_NAMES.length,
    `Ran out of type parameter names. Used all ${TYPE_PARAMETER_NAMES.length} of them. :c`
  );

  return `${TYPE_PARAMETER_NAMES[n]}${depth}`;
};

const removeWhiteSpace = (s: string): string => s.replaceAll(/\s/g, "");

const renderWithoutWhitespace = (ns: Node[], depth: number): string =>
  removeWhiteSpace(ns.map((it) => canonizeTypeInternal(it, depth)).join(""));

const getChildrenTextIfAny = (
  n: Node,
  depth: number,
  preserveWhitespace = false
): string => {
  const children = n.getChildren();

  return children.length > 0
    ? children
        .map((it) => canonizeTypeInternal(it, depth))
        .join(preserveWhitespace ? "�" : "")
    : n.getText();
};

const renderChildrenWithoutWhitespace = (n: Node, depth: number): string =>
  removeWhiteSpace(getChildrenTextIfAny(n, depth));

const renderChildrenWithWhitespace = (n: Node, depth: number): string =>
  getChildrenTextIfAny(n, depth, true);

type FnType = FunctionTypeNode | ArrowFunction | FunctionDeclaration;

const canonizeFnType = (fnType: FnType, depth: number): string => {
  fnType.getParameters().forEach((param, i): void => {
    param.rename(getNthParameterName(i, depth));
  });

  return renderChildrenWithoutWhitespace(fnType, depth + 1);
};

const canonizeTypeParameter = (
  typeParameter: TypeParameterDeclaration,
  depth: number
): string => {
  const nTypeParametersForDepth = typeParametersForDepth.get(depth - 1) ?? 0;
  typeParameter.rename(
    getNthTypeParameterName(nTypeParametersForDepth, depth - 1)
  );
  typeParametersForDepth.set(depth - 1, nTypeParametersForDepth + 1);

  // make sure the whitespace in "T extends SomeType" gets preserved
  return renderChildrenWithWhitespace(typeParameter, depth);
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

const conditionalRender = <T extends Node>(
  node: T,
  intersectionCondition: (
    intersection: (kinds: SyntaxKind[]) => number
  ) => boolean,
  ifTrueRender: string,
  elseRender: string
): string => {
  const parentsKinds = node.getAncestors().map((it) => it.getKind());

  return intersectionCondition(R.pipe(R.intersection(parentsKinds), R.length))
    ? ifTrueRender
    : elseRender;
};

let typeParametersForDepth: Map<number, number>;

const canonizeTypeInternal = (node: Node, depth: number): string => {
  const kind = node.getKind();

  switch (kind) {
    case SyntaxKind.FunctionDeclaration:
      return canonizeFnType(
        node as KindToNodeMappings[SyntaxKind.FunctionDeclaration],
        depth
      );

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

    case SyntaxKind.TypeParameter:
      return canonizeTypeParameter(
        node as KindToNodeMappings[SyntaxKind.TypeParameter],
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
      return conditionalRender(
        node,
        (intersection) =>
          intersection([
            SyntaxKind.Parameter,
            SyntaxKind.FunctionType,
            SyntaxKind.PropertySignature,
            SyntaxKind.UnionType,
            SyntaxKind.EnumDeclaration,
          ]) > 0,
        node.getText(),
        ""
      );

    case SyntaxKind.SemicolonToken:
      return conditionalRender(
        node,
        (intersection) => intersection([SyntaxKind.PropertySignature]) > 0,
        node.getText(),
        ""
      );

    case SyntaxKind.EqualsGreaterThanToken:
      return conditionalRender(
        node,
        (intersection) => intersection([SyntaxKind.ArrowFunction]) > 0,
        "",
        node.getText()
      );

    case SyntaxKind.ColonToken:
      return conditionalRender(
        node,
        (intersection) =>
          intersection([SyntaxKind.Parameter, SyntaxKind.PropertySignature]) ===
          0,
        "=>",
        node.getText()
      );

    case SyntaxKind.FunctionKeyword:
    case SyntaxKind.TypeKeyword:
    case SyntaxKind.EqualsToken:
    case SyntaxKind.Block:
    case SyntaxKind.NewKeyword:
    case SyntaxKind.ExclamationToken:
    case SyntaxKind.EqualsEqualsEqualsToken:
      return "";

    case SyntaxKind.OpenParenToken:
    case SyntaxKind.CloseParenToken:
    case SyntaxKind.OpenBracketToken:
    case SyntaxKind.CloseBracketToken:
    case SyntaxKind.OpenBraceToken:
    case SyntaxKind.CloseBraceToken:
    case SyntaxKind.LessThanToken:
    case SyntaxKind.GreaterThanToken:
    case SyntaxKind.CommaToken:
    case SyntaxKind.ArrayType:
    case SyntaxKind.StringKeyword:
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.VoidKeyword:
    case SyntaxKind.NeverKeyword:
    case SyntaxKind.TypeReference:
    case SyntaxKind.EnumDeclaration:
    case SyntaxKind.UnionType:
    case SyntaxKind.IntersectionType:
    case SyntaxKind.EnumKeyword:
    case SyntaxKind.EnumMember:
    case SyntaxKind.QualifiedName:
    case SyntaxKind.DotToken:
    case SyntaxKind.VariableDeclaration:
    case SyntaxKind.NewExpression:
    case SyntaxKind.CallExpression:
    case SyntaxKind.PropertyAccessExpression:
    case SyntaxKind.BarToken:
    case SyntaxKind.StringLiteral:
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.BooleanKeyword:
    case SyntaxKind.FalseKeyword:
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.ExtendsKeyword:
    case SyntaxKind.IndexedAccessType:
    case SyntaxKind.ParenthesizedExpression:
    case SyntaxKind.BinaryExpression:
    case SyntaxKind.QuestionQuestionToken:
    case SyntaxKind.ArrayLiteralExpression:
    case SyntaxKind.AmpersandToken:
    case SyntaxKind.UndefinedKeyword:
    case SyntaxKind.ElementAccessExpression:
    case SyntaxKind.NonNullExpression:
    case SyntaxKind.UnknownKeyword:
      return renderChildrenWithoutWhitespace(node, depth);

    default:
      throw new Error(`Unable to handle node of kind ${node.getKindName()}.`);
    // return removeWhiteSpace(getTypeText(type));
  }
};

const canonizeType = (type: Node): string => {
  typeParametersForDepth = new Map<number, number>([[0, 0]]);
  return canonizeTypeInternal(type, 0).replaceAll("�", " ");
};

export default canonizeType;
