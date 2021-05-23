import R from "ramda";
import {
  ExportedDeclarations,
  KindToNodeMappings,
  Project,
  SyntaxKind,
} from "ts-morph";
import { NamedExportedArrowFn } from "./types";

const project = new Project();

project.addSourceFileAtPath("tests/consts.ts");
project.addSourceFileAtPath("tests/functions.ts");

const constsSourceFile = project.getSourceFileOrThrow("tests/consts.ts");
const functionsSourceFile = project.getSourceFileOrThrow("tests/functions.ts");

const constsDeclarations = constsSourceFile.getExportedDeclarations();
const functionsDeclarations = functionsSourceFile.getExportedDeclarations();

const tc = project.getTypeChecker();

type DeclarationsByKind = Map<SyntaxKind, ExportedDeclarations[]>;

const mapAsKind = <TKind extends SyntaxKind>(
  declarations: ExportedDeclarations[] | undefined,
  kind: TKind
): KindToNodeMappings[TKind][] | undefined =>
  declarations
    ?.map((it) => it.asKind(kind))
    .filter((it): it is KindToNodeMappings[TKind] => it !== undefined);

const logDeclarations = (
  fileDeclarations: ReadonlyMap<string, ExportedDeclarations[]>
) => {
  const declarations = Array.from(fileDeclarations.values()).flatMap(
    R.identity
  );

  const allDeclarationKinds: Set<SyntaxKind> = declarations.reduce<
    Set<SyntaxKind>
  >((ds, d) => {
    ds.add(d.getKind());
    return ds;
  }, new Set<SyntaxKind>());

  console.log(
    `All declaration syntax kinds: ${Array.from(allDeclarationKinds).join(
      ", "
    )}`
  );

  const declarationsByKind: DeclarationsByKind = declarations.reduce(
    (ds, d) => {
      const kind = d.getKind();
      const declarationsOfKind = ds.get(kind);

      if (declarationsOfKind) {
        ds.set(kind, [...declarationsOfKind, d]);
        return ds;
      }

      ds.set(kind, [d]);
      return ds;
    },
    new Map<SyntaxKind, ExportedDeclarations[]>()
  );

  const functionDeclarations = mapAsKind(
    declarationsByKind.get(SyntaxKind.FunctionDeclaration),
    SyntaxKind.FunctionDeclaration
  );

  const arrowFunctions = mapAsKind(
    declarationsByKind.get(SyntaxKind.VariableDeclaration),
    SyntaxKind.VariableDeclaration
  )
    ?.map((it) => ({
      name: it.getName(),
      arrowFn: it.getInitializerIfKind(SyntaxKind.ArrowFunction),
    }))
    .filter((it): it is NamedExportedArrowFn => it.arrowFn !== undefined);

  console.log(`function declarations: ${functionDeclarations?.length ?? 0}`);
  console.log(`arrow functions: ${arrowFunctions?.length ?? 0}`);

  functionDeclarations?.forEach((d) => {
    const name = d.getName();
    const parametersTypes = d
      .getParameters()
      .map((p) => tc.getTypeText(p.getType()));
    const returnType = tc.getTypeText(d.getReturnType());
    console.log(`name: ${name}`);
    console.log(`parameters: ${parametersTypes}`);
    console.log(`return type: ${returnType}`);
  });

  arrowFunctions?.forEach((d) => {
    const { name, arrowFn } = d;
    const parametersTypes = arrowFn
      .getParameters()
      .map((p) => tc.getTypeText(p.getType()));
    const returnType = tc.getTypeText(arrowFn.getReturnType());
    console.log(`name: ${name}`);
    console.log(`parameters: ${parametersTypes}`);
    console.log(`return type: ${returnType}`);
  });
};

console.log("consts.ts declarations:");
logDeclarations(constsDeclarations);

console.log("\n\n\n");

console.log("functions.ts declarations:");
logDeclarations(functionsDeclarations);
