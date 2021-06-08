import { Node, ts, TypeChecker } from "ts-morph";

const getOriginalTypeName =
  (typeChecker: TypeChecker) =>
  (node: Node<ts.Node>): string => {
    const nodeType = node.getType();
    return typeChecker.getTypeText(
      nodeType,
      undefined,
      ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
    );
  };

export default getOriginalTypeName;
