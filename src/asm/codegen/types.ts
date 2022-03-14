import {AstImmExpr} from '../parser';

export type Program = {
  entrypointAddr: number,
  labels: Map<string, number>,
  codeExprs: Map<number, AstImmExpr>,
  code: Uint8Array,
};