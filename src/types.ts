import {
  ArrowFunction,
  FunctionDeclaration,
  Type,
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
  parameterTypes: Type[];
  returnType: Type;
};

export type Fn = FnDeclaration | ArrowFnAndDeclaration;

export type FnIndex = Map<FnHash, Fn[]>;
