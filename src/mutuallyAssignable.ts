import { createProjectSync, ts } from "@ts-morph/bootstrap";
import { Type } from "ts-morph";
import { typeChecker } from "./project";

const inMemoryProject = createProjectSync({ useInMemoryFileSystem: true });

const makeTypeTest = (a: Type, b: Type): string =>
  `type A = ${typeChecker.getTypeText(a)};
type B = ${typeChecker.getTypeText(b)};

const a: A = {} as any;
const b: B = {} as any;

const p: A = b;
const q: B = a;`;

const mutuallyAssignable = (a: Type, b: Type): boolean => {
  inMemoryProject.createSourceFile("assignmentCheck.ts", makeTypeTest(a, b));
  const program = inMemoryProject.createProgram();
  const diagnostics = ts.getPreEmitDiagnostics(program);

  // good enough for now
  return diagnostics.length === 0;
};

export default mutuallyAssignable;
