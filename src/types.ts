import {
  ArrowFunction,
  FunctionDeclaration,
  VariableDeclaration,
} from "ts-morph";

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

export type Fn = FnDeclaration | ArrowFnAndDeclaration;
