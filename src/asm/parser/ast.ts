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

type AstOneOpInstr<Type extends string, OpType extends AstImmOrRegExpr> = AstNode<Type> & {
  op: OpType,
};

type AstTwoOpInstr<Type extends string,
                   Op1Type extends AstImmOrRegExpr,
                   Op2Type extends AstImmOrRegExpr> = AstNode<Type> & {
  op1: Op1Type,
  op2: Op2Type,
};

type AstRegImmInstr<Type extends string> = AstNode<Type> & {
  register: Registers,
  immediate: number,
};

type AstRegAddrInstr<Type extends string> = AstNode<Type> & {
  register: Registers,
  address: Address,
};

type AstAddrImmInstr<Type extends string> = AstNode<Type> & {
  address: Address,
  immediate: number,
};

type AstAddrRegInstr<Type extends string> = AstNode<Type> & {
  address: Address,
  register: Registers,
};

type AstRegRegInstr<Type extends string> = AstNode<Type> & {
  register1: Registers,
  register2: Registers,
};

type AstRegInstr<Type extends string> = AstNode<Type> & {
  register: Registers,
};

type AstAddrInstr<Type extends string> = AstNode<Type> & {
  address: Address,
};

export type NopInstr = AstNode<'NopInstr'>;
export type EndInstr = AstNode<'EndInstr'>;
export type VsyncInstr = AstNode<'VsyncInstr'>;
export type BrkInstr = AstNode<'BrkInstr'>;

export type MovInstr = AstTwoOpInstr<'MovInstr', AstRegExpr, AstImmOrRegExpr>;

export type StoiInstr = AstAddrImmInstr<'StoiInstr'>;
export type StoibInstr = AstAddrImmInstr<'StoibInstr'>;
export type StoriInstr = AstRegImmInstr<'StoriInstr'>;
export type StoribInstr = AstRegImmInstr<'StoribInstr'>;
export type StorInstr = AstAddrRegInstr<'StorInstr'>;
export type StorbInstr = AstAddrRegInstr<'StorbInstr'>;
export type StorrInstr = AstRegRegInstr<'StorrInstr'>;
export type StorrbInstr = AstRegRegInstr<'StorrbInstr'>;
export type LodrInstr = AstRegAddrInstr<'LodrInstr'>;
export type LodrbInstr = AstRegAddrInstr<'LodrbInstr'>;
export type LodrrInstr = AstRegRegInstr<'LodrrInstr'>;
export type LodrrbInstr = AstRegRegInstr<'LodrrbInstr'>;

export type AddInstr = AstTwoOpInstr<'AddInstr', AstRegExpr, AstImmOrRegExpr>;
export type SubInstr = AstTwoOpInstr<'SubInstr', AstRegExpr, AstImmOrRegExpr>;
export type MulInstr = AstTwoOpInstr<'MulInstr', AstRegExpr, AstImmOrRegExpr>;
export type DivInstr = AstTwoOpInstr<'DivInstr', AstRegExpr, AstImmOrRegExpr>;
export type ModInstr = AstTwoOpInstr<'ModInstr', AstRegExpr, AstImmOrRegExpr>;
export type IncInstr = AstRegInstr<'IncInstr'>;
export type DecInstr = AstRegInstr<'DecInstr'>;

export type ShlInstr = AstTwoOpInstr<'ShlInstr', AstRegExpr, AstImmOrRegExpr>;
export type ShrInstr = AstTwoOpInstr<'ShrInstr', AstRegExpr, AstImmOrRegExpr>;
export type OrInstr = AstTwoOpInstr<'OrInstr', AstRegExpr, AstImmOrRegExpr>;
export type AndInstr = AstTwoOpInstr<'AndInstr', AstRegExpr, AstImmOrRegExpr>;
export type XorInstr = AstTwoOpInstr<'XorInstr', AstRegExpr, AstImmOrRegExpr>;
export type NotInstr = AstRegInstr<'NotInstr'>;

export type CmpInstr = AstTwoOpInstr<'CmpInstr', AstRegExpr, AstImmOrRegExpr>;

export type JmpInstr = AstOneOpInstr<'JmpInstr', AstImmOrRegExpr>;
export type JzInstr = AstOneOpInstr<'JzInstr', AstImmOrRegExpr>;
export type JnzInstr = AstOneOpInstr<'JnzInstr', AstImmOrRegExpr>;
export type JgInstr = AstOneOpInstr<'JgInstr', AstImmOrRegExpr>;
export type JgzInstr = AstOneOpInstr<'JgzInstr', AstImmOrRegExpr>;
export type JlInstr = AstOneOpInstr<'JlInstr', AstImmOrRegExpr>;
export type JlzInstr = AstOneOpInstr<'JlzInstr', AstImmOrRegExpr>;
export type JoInstr = AstOneOpInstr<'JoInstr', AstImmOrRegExpr>;
export type JdzInstr = AstOneOpInstr<'JdzInstr', AstImmOrRegExpr>;

export type CoreInstr = NopInstr |
    EndInstr |
    VsyncInstr |
    BrkInstr;

export type MemoryInstr =
    MovInstr |
    StoiInstr |
    StoibInstr |
    StoriInstr |
    StoribInstr |
    StorInstr |
    StorbInstr |
    StorrInstr |
    StorrbInstr |
    LodrInstr |
    LodrbInstr |
    LodrrInstr |
    LodrrbInstr;

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

export type Instr = CoreInstr |
    MemoryInstr |
    ArithmeticInstr |
    LogicInstr |
    CompareInstr |
    JumpInstr;

export type Label = AstNode<'Label'> & {
  label: string,
};

export type Stmt = Instr | Label;

export type Ast = Stmt[];