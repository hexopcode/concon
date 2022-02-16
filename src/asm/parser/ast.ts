import {Registers} from '../../core';

export type Address = number|string;

type AstNode<Type extends string> = {
  type: Type,
  line: number,
};

export type AstImmExpr = AstNode<'AstImmExpr'> & {
  // TODO: support more complex expressions
  value: string|number,
};

export type AstRegExpr = AstNode<'AstRegExpr'> & {
  value: Registers,
}

export type AstImmOrRegExpr = AstImmExpr|AstRegExpr;

type AstOneOpStmt<Type extends string, OpType extends AstImmOrRegExpr> = AstNode<Type> & {
  op: OpType,
};

type AstTwoOpStmt<Type extends string,
                   Op1Type extends AstImmOrRegExpr,
                   Op2Type extends AstImmOrRegExpr> = AstNode<Type> & {
  op1: Op1Type,
  op2: Op2Type,
};

export type NopInstr = AstNode<'NopInstr'>;
export type EndInstr = AstNode<'EndInstr'>;
export type VsyncInstr = AstNode<'VsyncInstr'>;
export type BrkInstr = AstNode<'BrkInstr'>;

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
export type PushAllInstr = AstNode<'PushAllInstr'>;
export type PopInstr = AstOneOpStmt<'PopInstr', AstRegExpr>;
export type PopAllInstr = AstNode<'PopAllInstr'>;

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

export type CallInstr = PushInstr |
    PushAllInstr |
    PopInstr |
    PopAllInstr;

export type Instr = CoreInstr |
    MemoryInstr |
    ArithmeticInstr |
    LogicInstr |
    CompareInstr |
    JumpInstr |
    CallInstr;

export type Label = AstNode<'Label'> & {
  label: string,
};

export type Stmt = Instr | Label;

export type Ast = Stmt[];