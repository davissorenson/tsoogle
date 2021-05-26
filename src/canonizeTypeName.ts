import { Type } from "ts-morph";
import { typeChecker } from "./project";

function canonizeTypeName(type: string): string;
function canonizeTypeName(type: Type): string;
function canonizeTypeName(type: Type | string): string {
  const typeName =
    typeof type === "string" ? type : typeChecker.getTypeText(type);

  // (a: string, b: string) => string[]
  // =>
  // (string, string) => string[]

  return typeName;
}

export default canonizeTypeName;
