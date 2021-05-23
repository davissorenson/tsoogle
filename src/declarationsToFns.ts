import { ExportedDeclarations, KindToNodeMappings, SyntaxKind } from "ts-morph";
import { ArrowFnAndDeclaration, Fn, FnDeclaration, FnType } from "./types";

const mapAsKind = <TKind extends SyntaxKind>(
  declarations: ExportedDeclarations[] | undefined,
  kind: TKind
): KindToNodeMappings[TKind][] | undefined =>
  declarations
    ?.map((it) => it.asKind(kind))
    .filter((it): it is KindToNodeMappings[TKind] => it !== undefined);

type DeclarationsByKind = Map<SyntaxKind, ExportedDeclarations[]>;

const declarationsToFns = (declarations: ExportedDeclarations[]): Fn[] => {
  const declarationsByKind: DeclarationsByKind = declarations.reduce(
    (ds, d) => {
      const kind = d.getKind();
      const declarationsOfKind = ds.get(kind);

      if (declarationsOfKind) {
        ds.set(kind, [...declarationsOfKind, d]);
        return ds;
      }

      ds.set(kind, [d]);
      return ds;
    },
    new Map<SyntaxKind, ExportedDeclarations[]>()
  );

  // TODO: clean up this mess
  const functionDeclarations: Fn[] =
    mapAsKind(
      declarationsByKind.get(SyntaxKind.FunctionDeclaration),
      SyntaxKind.FunctionDeclaration
    )
      ?.map((it) => ({
        type: FnType.FnDeclaration,
        declaration: it,
      }))
      .filter((it): it is FnDeclaration => it !== undefined) ?? [];

  const arrowFunctions: Fn[] =
    mapAsKind(
      declarationsByKind.get(SyntaxKind.VariableDeclaration),
      SyntaxKind.VariableDeclaration
    )
      ?.map((it) => ({
        type: FnType.ArrowFn,
        declaration: it,
        arrowFn: it.getInitializerIfKind(SyntaxKind.ArrowFunction),
      }))
      .filter((it): it is ArrowFnAndDeclaration => it.arrowFn !== undefined) ??
    [];

  return [...functionDeclarations, ...arrowFunctions];
};

export default declarationsToFns;
