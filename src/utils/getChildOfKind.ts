import { KindToNodeMappings, Node, SyntaxKind } from "ts-morph";

export const getChildOfKind = <TKind extends SyntaxKind>(
  node: Node,
  kind: TKind
): KindToNodeMappings[TKind] | undefined => {
  const childrenOfKind = node.getChildrenOfKind(kind);

  if (childrenOfKind.length === 1) {
    return childrenOfKind[0];
  }

  return;
};

export const getChildOfKindOrThrow = <TKind extends SyntaxKind>(
  node: Node,
  kind: TKind
): KindToNodeMappings[TKind] => {
  const childrenOfKind = node.getChildrenOfKind(kind);

  if (childrenOfKind.length === 1) {
    return childrenOfKind[0];
  }

  if (childrenOfKind.length > 1) {
    throw new Error(`Tried to get child of kind ${kind}, got more than one`);
  }

  throw new Error(`Did not find child of kind ${kind}`);
};
