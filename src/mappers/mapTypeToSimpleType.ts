import { ts } from "@ts-morph/common";
import { SimpleType } from "../types";
import mapSymbolToSimpleSymbol from "./mapSymbolToSimpleSymbol";

const mapTypeToSimpleType = (t: ts.Type): SimpleType => ({
  flags: t.flags,
  symbol: mapSymbolToSimpleSymbol(t.symbol),
  aliasTypeArguments: t.aliasTypeArguments?.map((ata) =>
    mapTypeToSimpleType(ata)
  ),
});

export default mapTypeToSimpleType;
