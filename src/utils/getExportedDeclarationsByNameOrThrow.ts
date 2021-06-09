import { ExportedDeclarations } from "ts-morph";

const getExportedDeclarationsByNameOrThrow = (
  declarations: ExportedDeclarations[],
  declarationName: string
): ExportedDeclarations => {
  const declarationAndName = declarations
    .map((declaration) => ({
      declaration,
      name: declaration.getSymbolOrThrow().getName(),
    }))
    .find(({ name }) => name === declarationName);

  if (declarationAndName) {
    return declarationAndName.declaration;
  }

  throw new Error(`Could not find declaration ${declarationName}`);
};

export default getExportedDeclarationsByNameOrThrow;
