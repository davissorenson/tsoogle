import R from "ramda";
import { ExportedDeclarations } from "ts-morph";
import project from "./project";

project.addSourceFileAtPath("tests/consts.ts");

const loadConstDeclarations = (): ExportedDeclarations[] =>
  Array.from(
    project
      .getSourceFileOrThrow("tests/consts.ts")
      .getExportedDeclarations()
      .values()
  ).flatMap(R.identity);

export default loadConstDeclarations;
