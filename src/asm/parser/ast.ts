import {Registers} from '../../core';

export type Address = number|string;

type AstNode<Type extends string> = {
  type: Type,
  line: number,
};

export type AstNodeType<Type extends AstNode<any>> = Omit<Type, 'line'>;

export type AstImmExpr = AstNode<'AstImmExpr'> & {
  // TODO: support more complex expressions
  value: string|number,
  isByte?: boolean,
};

export type AstRegExpr = AstNode<'AstRegExpr'> & {
  value: Registers,
};

export type AstLblExpr = AstNode<'AstLblExpr'> & {
  label: string,
};

export type AstStrExpr = AstNode<'AstStrExpr'> & {
  str: string,
};

export type AstImmOrRegExpr = AstImmExpr|AstRegExpr;
export type AstExpr = AstImmOrRegExpr|AstLblExpr;

export type AstInstrStmt<Type extends string> = AstNode<Type> & {
  label?: AstLblExpr,
};

export type AstOneOpStmt<Type extends string, OpType extends AstExpr> = AstInstrStmt<Type> & {
  op: OpType,
};

export type AstTwoOpStmt<Type extends string,
                   Op1Type extends AstExpr,
                   Op2Type extends AstExpr> = AstInstrStmt<Type> & {
  op1: Op1Type,
  op2: Op2Type,
};

export type NopInstr = AstInstrStmt<'NopInstr'>;
export type EndInstr = AstInstrStmt<'EndInstr'>;
export type VsyncInstr = AstInstrStmt<'VsyncInstr'>;
export type BrkInstr = AstInstrStmt<'BrkInstr'>;

export type MovInstr = AstTwoOpStmt<'MovInstr', AstRegExpr, AstImmOrRegExpr>;
export type StoInstr = AstTwoOpStmt<'StoInstr', AstImmOrRegExpr, AstImmOrRegExpr>;
export type StobInstr = AstTwoOpStmt<'StobInstr', AstImmOrRegExpr, AstImmOrRegExpr>;
export type LodInstr = AstTwoOpStmt<'LodInstr', AstRegExpr, AstImmOrRegExpr>;
export type LodbInstr = AstTwoOpStmt<'LodbInstr', AstRegExpr, AstImmOrRegExpr>;

export type AddInstr = AstTwoOpStmt<'AddInstr', AstRegExpr, AstImmOrRegExpr>;
export type SubInstr = AstTwoOpStmt<'SubInstr', AstRegExpr, AstImmOrRegExpr>;
export type MulInstr = AstTwoOpStmt<'MulInstr', AstRegExpr, AstImmOrRegExpr>;
export type DivInstr = AstTwoOpStmt<'DivInstr', AstRegExpr, AstImmOrRegExpr>;
export type ModInstr = AstTwoOpStmt<'ModInstr', AstRegExpr, AstImmOrRegExpr>;
export type IncInstr = AstOneOpStmt<'IncInstr', AstRegExpr>;
export type DecInstr = AstOneOpStmt<'DecInstr', AstRegExpr>;

export type ShlInstr = AstTwoOpStmt<'ShlInstr', AstRegExpr, AstImmOrRegExpr>;
export type ShrInstr = AstTwoOpStmt<'ShrInstr', AstRegExpr, AstImmOrRegExpr>;
export type OrInstr = AstTwoOpStmt<'OrInstr', AstRegExpr, AstImmOrRegExpr>;
export type AndInstr = AstTwoOpStmt<'AndInstr', AstRegExpr, AstImmOrRegExpr>;
export type XorInstr = AstTwoOpStmt<'XorInstr', AstRegExpr, AstImmOrRegExpr>;
export type NotInstr = AstOneOpStmt<'NotInstr', AstRegExpr>;

export type CmpInstr = AstTwoOpStmt<'CmpInstr', AstRegExpr, AstImmOrRegExpr>;

export type JmpInstr = AstOneOpStmt<'JmpInstr', AstImmOrRegExpr>;
export type JzInstr = AstOneOpStmt<'JzInstr', AstImmOrRegExpr>;
export type JnzInstr = AstOneOpStmt<'JnzInstr', AstImmOrRegExpr>;
export type JgInstr = AstOneOpStmt<'JgInstr', AstImmOrRegExpr>;
export type JgzInstr = AstOneOpStmt<'JgzInstr', AstImmOrRegExpr>;
export type JlInstr = AstOneOpStmt<'JlInstr', AstImmOrRegExpr>;
export type JlzInstr = AstOneOpStmt<'JlzInstr', AstImmOrRegExpr>;
export type JoInstr = AstOneOpStmt<'JoInstr', AstImmOrRegExpr>;
export type JdzInstr = AstOneOpStmt<'JdzInstr', AstImmOrRegExpr>;

export type PushInstr = AstOneOpStmt<'PushInstr', AstImmOrRegExpr>;
export type PushAllInstr = AstInstrStmt<'PushAllInstr'>;
export type PopInstr = AstOneOpStmt<'PopInstr', AstRegExpr>;
export type PopAllInstr = AstInstrStmt<'PopAllInstr'>;
export type CallInstr = AstOneOpStmt<'CallInstr', AstLblExpr>;
export type RetInstr = AstInstrStmt<'RetInstr'>;

export type OutInstr = AstTwoOpStmt<'OutInstr', AstImmOrRegExpr, AstImmOrRegExpr>;
export type OutbInstr = AstTwoOpStmt<'OutbInstr', AstImmOrRegExpr, AstImmOrRegExpr>;

export type DataByte = AstInstrStmt<'DataByte'> & {
  bytes: AstImmExpr[],
};

export type DataWord = AstInstrStmt<'DataWord'> & {
  words: AstImmExpr[],
};

export type DataStr = AstInstrStmt<'DataStr'> & {
  strs: AstStrExpr[],
};

export type CoreInstr = NopInstr |
    EndInstr |
    VsyncInstr |
    BrkInstr;

export type MemoryInstr =
    MovInstr |
    StoInstr |
    StobInstr |
    LodInstr |
    LodbInstr;

export type ArithmeticInstr = AddInstr |
    SubInstr |
    MulInstr |
    DivInstr |
    ModInstr |
    IncInstr |
    DecInstr;

export type LogicInstr = ShlInstr |
    ShrInstr |
    OrInstr |
    AndInstr |
    XorInstr |
    NotInstr;

export type CompareInstr = CmpInstr;

export type JumpInstr = JmpInstr |
    JzInstr |
    JnzInstr |
    JgInstr |
    JgzInstr |
    JlInstr |
    JlzInstr |
    JoInstr |
    JdzInstr;

export type CallInstrs = PushInstr |
    PushAllInstr |
    PopInstr |
    PopAllInstr |
    CallInstr |
    RetInstr;

export type IoInstrs = OutInstr |
    OutbInstr;

export type DataInstrs = DataByte |
    DataWord |
    DataStr;

export type Instr = CoreInstr |
    MemoryInstr |
    ArithmeticInstr |
    LogicInstr |
    CompareInstr |
    JumpInstr |
    CallInstrs |
    IoInstrs |
    DataInstrs;

export type BlockStmt = AstNode<'BlockStmt'> & {
  instrs: Instr[],
};

export type ProcStmt = AstNode<'ProcStmt'> & {
  name: string,
  pub: boolean,
  impl: BlockStmt,
};

export type UseStmt = AstNode<'UseStmt'> & {
  names: string[],
  path: string,
};

export type ModuleAst<Type extends string> = AstNode<Type> & {
  path: string,
  uses: UseStmt[],
  procs: ProcStmt[],
};

export type LibraryAst = ModuleAst<'LibraryAst'>;
export type EntrypointAst = ModuleAst<'EntrypointAst'> & {
  main: BlockStmt,
};

export type AnyModuleAst = LibraryAst | EntrypointAst;

export type ProgramAst = AstNode<'ProgramAst'> & {
  libs: LibraryAst[],
  entrypoint: EntrypointAst,
};