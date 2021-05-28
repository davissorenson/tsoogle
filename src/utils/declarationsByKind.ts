import { ExportedDeclarations, KindToNodeMappings, SyntaxKind } from "ts-morph";

type DeclarationsByKind = Map<SyntaxKind, KindToNodeMappings[SyntaxKind][]>;

export const getAllDeclarationsOfKind = <TKind extends SyntaxKind>(
  decl: DeclarationsByKind,
  kind: TKind
): KindToNodeMappings[TKind][] =>
  (decl.get(kind) ?? []).map((it) => it.asKindOrThrow(kind));

export const getDeclarationByName = <
  TKind extends SyntaxKind,
  NKind extends KindToNodeMappings[TKind] & { getName: () => string }
>(
  declarations: NKind[],
  name: string
): NKind | undefined => declarations.filter((it) => it.getName() === name)[0];

export const getDeclarationByNameOrThrow = <
  TKind extends SyntaxKind,
  NKind extends KindToNodeMappings[TKind] & { getName: () => string }
>(
  declarations: NKind[],
  name: string
): NKind => {
  const declaration = getDeclarationByName(declarations, name);

  if (!declaration) {
    throw new Error(`Declaration with name ${name} not found`);
  }

  return declaration;
};

const declarationsByKind = (
  declarations: ExportedDeclarations[]
): DeclarationsByKind =>
  declarations.reduce((ds, d) => {
    const kind = d.getKind();
    const declarationsOfKind = ds.get(kind);

    if (declarationsOfKind) {
      ds.set(kind, [...declarationsOfKind, d.asKindOrThrow(kind)]);
      return ds;
    }

    ds.set(kind, [d]);
    return ds;
  }, new Map<SyntaxKind, KindToNodeMappings[SyntaxKind][]>());

export default declarationsByKind;
