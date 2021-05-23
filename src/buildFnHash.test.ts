import R from "ramda";
import { Project } from "ts-morph";
import buildFnHash from "./buildFnHash";
import declarationsToFns from "./declarationsToFns";
import { Fn } from "./types";

const project = new Project();
project.addSourceFileAtPath("tests/consts.ts");
const constDeclarations = Array.from(
  project
    .getSourceFileOrThrow("tests/consts.ts")
    .getExportedDeclarations()
    .values()
).flatMap(R.identity);

const getFnByName = (fns: Fn[], name: string): Fn =>
  fns.find((fn) => fn.declaration.getName() === name)!;

const fns = declarationsToFns(constDeclarations);
const someFunction1A = getFnByName(fns, "someFunction1A");
const someFunction1B = getFnByName(fns, "someFunction1B");
const simpleFunction1 = getFnByName(fns, "simpleFunction1");

describe("buildFnHash", () => {
  describe("arrow functions", () => {
    const someFunction1AHash = buildFnHash(someFunction1A);
    const someFunction1BHash = buildFnHash(someFunction1B);
    const simpleFunction1Hash = buildFnHash(simpleFunction1);

    describe("type-equivalent functions are hashed the same", () => {
      it("someFunction1A and someFunction1B", () => {
        expect(someFunction1AHash).toEqual(someFunction1BHash);
      });
    });

    describe("type-incompatible functions are hashed differently", () => {
      it("someFunction1A and simpleFunction1", () => {
        expect(someFunction1AHash).not.toEqual(simpleFunction1Hash);
      });
    });
  });
});
