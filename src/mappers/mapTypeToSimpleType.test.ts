import declarationsToFns from "../declarationsToFns";
import { loadConstDeclarations } from "../loaders/loadDeclarations";
import project from "../project";
import { ArrowFnAndDeclaration } from "../types";
import { getFnByName } from "../utils";
import mapTypeToSimpleType from "./mapTypeToSimpleType";

const constDeclarations = loadConstDeclarations();
const fns = declarationsToFns(constDeclarations);
const someFunction1A = getFnByName(
  fns,
  "someFunction1A"
) as ArrowFnAndDeclaration;

const tc = project.getTypeChecker();

describe("mapTypeToSimpleType", () => {
  const arrowFnType = someFunction1A.arrowFn.getType();
  const simpleArrowFnType = mapTypeToSimpleType(arrowFnType.compilerType);
  // const typeFlags = someFunction1A.arrowFn.getType().getFlags();

  const typeDescription = tc.getTypeText(arrowFnType);

  console.log("typeDescription:", typeDescription);

  it("should match or something", () => {
    expect(simpleArrowFnType).toEqual({});
  });
});
