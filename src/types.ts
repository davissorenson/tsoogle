import {
  ArrowFunction,
  FunctionDeclaration,
  ts,
  VariableDeclaration,
} from "ts-morph";

export type NamedExportedArrowFn = {
  name: string;
  arrowFn: ArrowFunction;
};

export enum FnType {
  FnDeclaration,
  ArrowFn,
}

export type ArrowFnAndDeclaration = {
  type: FnType.ArrowFn;
  declaration: VariableDeclaration;
  arrowFn: ArrowFunction;
};

export type FnDeclaration = {
  type: FnType.FnDeclaration;
  declaration: FunctionDeclaration;
};

export type FnHash = {
  parameterTypes: ts.Type[];
  returnType: ts.Type;
};

export type Fn = FnDeclaration | ArrowFnAndDeclaration;

export type FnIndex = Map<FnHash, Fn[]>;
