import {AstImmExpr} from '../parser';

export type Module = {
  path: string,
  uses: Map<string, string>,
  labels: Map<string, number>,
  codeExprs: Map<number, AstImmExpr>,
  code: Uint8Array,
};

export type EntrypointModule = Module & {
  mainOffset: number,
};

export type Program = {
  libs: Map<string, Module>,
  entrypoint: EntrypointModule,
};