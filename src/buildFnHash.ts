import { Fn, FnHash, FnType } from "./types";

const buildFnHash = (fn: Fn): FnHash => {
  switch (fn.type) {
    case FnType.FnDeclaration:
      return {
        parameterTypes: fn.declaration
          .getParameters()
          .map((it) => it.getType()),
        returnType: fn.declaration.getReturnType(),
      };
    case FnType.ArrowFn:
      return {
        parameterTypes: fn.arrowFn.getParameters().map((it) => it.getType()),
        returnType: fn.arrowFn.getReturnType(),
      };
  }
};

export default buildFnHash;
