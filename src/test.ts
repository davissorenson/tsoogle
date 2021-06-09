import { Project } from "ts-morph";
import DeclarationIndex from "./DeclarationIndex";
import stringToCanonizedType from "./stringToCanonizedType";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const sourceFiles = project.getSourceFiles();

console.log(`found ${sourceFiles.length} source files`);
// console.log(
//   `source files:\n${sourceFiles.map((sf) => sf.getBaseName()).join("\n")}`
// );

// .filter(([name]) => name === "getFnByName");
// console.log("----------------");
// console.log("----------------");
// console.log(
//   `declarations:\n${declarations.map(([declName]) => declName).join("\n")}`
// );

const declarationIndex = new DeclarationIndex(
  project.getTypeChecker(),
  sourceFiles
);

console.log(declarationIndex.debugSummary());

const typeCanonizedFromString = stringToCanonizedType("(abc: string) => void");

console.log(`typeCanonizedFromString: ${typeCanonizedFromString}`);
