import { ExportedDeclarations } from "ts-morph";

export type DeclarationWithName = {
  declaration: ExportedDeclarations;
  name: string;
};

export type DeclarationWithMetaData = DeclarationWithName & {
  originalTypeString: string;
  filePath: string;
  lineNo: number;
};

// TODO: try out nominal typing for hash
export type HashAndDeclarationWithMetadata = {
  hash: string;
  declarationWithMetadata: DeclarationWithMetaData;
};
