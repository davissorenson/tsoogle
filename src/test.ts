import { Project } from "ts-morph";
import DeclarationIndex, {
  declarationsSummary,
} from "./declarationIndex/DeclarationIndex";
import stringToCanonizedType from "./stringToCanonizedType";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const sourceFiles = project.getSourceFiles();

console.log(`found ${sourceFiles.length} source files`);

const declarationIndex = new DeclarationIndex(
  project.getTypeChecker(),
  sourceFiles
);

console.log(declarationIndex.debugSummary());

const typeCanonizedFromString = stringToCanonizedType(
  "(declarations: ExportedDeclarations[]) => DeclarationsByKind"
);

console.log(`typeCanonizedFromString: ${typeCanonizedFromString}`);

const searchResults = declarationIndex.searchByHash(typeCanonizedFromString);

console.log(
  `search results in the index: ${searchResults.length}\n${declarationsSummary(
    searchResults
  )}`
);
