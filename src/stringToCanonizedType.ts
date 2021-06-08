import { ExportedDeclarations, Project } from "ts-morph";
import canonizeType from "./canonizeType";
import flattenMapValues from "./utils/flattenMapValues";

const FILENAME = "test.ts";
const TYPENAME = "TsoogleTarget";

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

const project = new Project({ useInMemoryFileSystem: true });

const stringToCanonizedType = (typeDescription: string): string => {
  const sourceFile = project.createSourceFile(
    FILENAME,
    `export type ${TYPENAME} = ${typeDescription};`
  );

  const exportedDeclarations = sourceFile.getExportedDeclarations();
  const declaration = getExportedDeclarationsByNameOrThrow(
    flattenMapValues(exportedDeclarations),
    TYPENAME
  );

  return canonizeType(declaration);
};

export default stringToCanonizedType;
