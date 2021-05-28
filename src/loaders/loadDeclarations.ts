import { ExportedDeclarations } from "ts-morph";
import project from "../project";
import flattenMapValues from "../utils/flattenMapValues";

project.addSourceFileAtPath("tests/consts.ts");
project.addSourceFileAtPath("tests/types.ts");

const loadDeclarations = (
  fileName: string,
  load: boolean = false
): ExportedDeclarations[] => {
  if (load) {
    project.addSourceFileAtPath(fileName);
  }

  return flattenMapValues(
    project.getSourceFileOrThrow(fileName).getExportedDeclarations()
  );
};

export const loadConstDeclarations = (): ExportedDeclarations[] =>
  loadDeclarations("tests/consts.ts");

export const loadTypeDeclarations = (): ExportedDeclarations[] =>
  loadDeclarations("tests/types.ts");

export default loadDeclarations;
