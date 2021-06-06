import R from "ramda";
import { Project } from "ts-morph";
import buildDeclarationIndex from "./buildDeclarationIndex";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const sourceFiles = project.getSourceFiles();

console.log(`found ${sourceFiles.length} source files`);
// console.log(
//   `source files:\n${sourceFiles.map((sf) => sf.getBaseName()).join("\n")}`
// );

const declarations = sourceFiles.flatMap((it) =>
  Array.from(it.getExportedDeclarations())
);
// console.log("----------------");
console.log(
  `found ${R.sum(declarations.map(([_, decl]) => decl.length))} declarations`
);
// console.log("----------------");
// console.log(
//   `declarations:\n${declarations.map(([declName]) => declName).join("\n")}`
// );

const declarationIndex = buildDeclarationIndex(
  declarations.flatMap(([_, decls]) => decls)
);

console.log(declarationIndex.debugSummary());
