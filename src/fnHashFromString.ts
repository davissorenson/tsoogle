import { SyntaxKind, ts } from "ts-morph";
import project from "./project";
import { FnHash } from "./types";

const FAKE_FN_NAME = "fakeFn";

const makeFnString = (fnSignature: string): string =>
  `const ${FAKE_FN_NAME}: ${fnSignature} = {} as any;`;

const fnHashFromString = (fnSignature: string): FnHash | undefined => {
  const fnString = makeFnString(fnSignature);
  console.log("creating file with text", fnString);
  const file = project.createSourceFile("test_index.ts", fnString);

  let parameterTypes: ts.Type[];
  let returnType: ts.Type;

  try {
    const declaration = file.getVariableDeclarationOrThrow(FAKE_FN_NAME);
    console.log("declaration kind", declaration.getKindName());
    console.log(
      "initializer kind",
      declaration.getInitializer()?.getKindName()
    );
    const [fnType] = declaration.getDescendantsOfKind(SyntaxKind.FunctionType);
    parameterTypes = fnType
      .getParameters()
      .map((it) => it.getType().compilerType);
    returnType = fnType.getReturnType().compilerType;
  } catch (e) {
    console.error("Threw exception:", e);
    return;
  }

  const fnHash: FnHash = {
    parameterTypes,
    returnType,
  };

  file.deleteImmediatelySync();

  return fnHash;
};

export default fnHashFromString;
