import { createProjectSync, ts } from "@ts-morph/bootstrap";
import { Type } from "ts-morph";
import { typeChecker } from "./project";

const TYPE_CHECK_FILENAME = "assignmentCheck.ts";

const inMemoryProject = createProjectSync({ useInMemoryFileSystem: true });

const makeTypeTest = (a: Type, b: Type): string =>
  `type A = ${typeChecker.getTypeText(a)};
type B = ${typeChecker.getTypeText(b)};

const a: A = {} as any;
const b: B = {} as any;

const p: A = b;
const q: B = a;`;

const mutuallyAssignable = (a: Type, b: Type): boolean => {
  inMemoryProject.createSourceFile(TYPE_CHECK_FILENAME, makeTypeTest(a, b));
  const program = inMemoryProject.createProgram();
  const diagnostics = ts.getPreEmitDiagnostics(program);

  inMemoryProject.removeSourceFile(TYPE_CHECK_FILENAME);

  // good enough for now
  return diagnostics.length === 0;
};

export default mutuallyAssignable;
