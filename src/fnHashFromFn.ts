import { Fn, FnHash, FnType } from "./types";

const fnHashFromFn = (fn: Fn): FnHash => {
  switch (fn.type) {
    case FnType.FnDeclaration:
      return {
        parameterTypes: fn.declaration
          .getParameters()
          .map((it) => it.getType().compilerType),
        returnType: fn.declaration.getReturnType().compilerType,
      };
    case FnType.ArrowFn:
      return {
        parameterTypes: fn.arrowFn
          .getParameters()
          .map((it) => it.getType().compilerType),
        returnType: fn.arrowFn.getReturnType().compilerType,
      };
  }
};

export default fnHashFromFn;
