import { ts } from "ts-morph";
import { SimpleSymbol } from "../types";

const mapSymbolToSimpleSymbol = (symbol: ts.Symbol): SimpleSymbol => ({
  flags: symbol.flags,
  escapedName: symbol.escapedName,
});

export default mapSymbolToSimpleSymbol;
