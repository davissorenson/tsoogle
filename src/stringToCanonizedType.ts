import canonizeType from "./canonizeType";
import project from "./project";
import flattenMapValues from "./utils/flattenMapValues";
import getExportedDeclarationsByNameOrThrow from "./utils/getExportedDeclarationsByNameOrThrow";

const FILENAME = "test.ts";
const TYPENAME = "TsoogleTarget";

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

  const canonizedTypeName = canonizeType(declaration);

  // clean up file we just created
  project.removeSourceFile(sourceFile);

  return canonizedTypeName;
};

export default stringToCanonizedType;
