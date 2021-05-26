import { assert } from "console";
import { ArrowFunction, FunctionTypeNode } from "ts-morph";
import { typeChecker } from "./project";

const PARAMETER_NAMES = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const getNthParameterName = (n: number): string => {
  assert(
    n < PARAMETER_NAMES.length,
    `Ran out of variable names. Used all ${PARAMETER_NAMES.length} of them. :c`
  );

  return PARAMETER_NAMES[n];
};

function canonizeTypeName(fnType: FunctionTypeNode | ArrowFunction): string {
  fnType
    .getParameters()
    .forEach((param, i) => param.rename(getNthParameterName(i)));

  return typeChecker.getTypeText(fnType.getType());
}

export default canonizeTypeName;
