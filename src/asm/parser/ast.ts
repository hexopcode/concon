import {Opcodes, Registers} from '../../core';

type AstNode<Type extends string> = {
  type: Type,
  line: number,
};

type AstInstr<Type extends string, Op extends Opcodes> = AstNode<Type> & {
  opcode: Op,
};

export type NopInstr = AstInstr<'NopInstr', Opcodes.NOP>;

export type EndInstr = AstInstr<'EndInstr', Opcodes.END>;

export type VsyncInstr = AstInstr<'VsyncInstr', Opcodes.VSYNC>;

export type MoviInstr = AstInstr<'MoviInstr', Opcodes.MOVI> & {
  register: Registers,
  immediate: number,
};

export type MovrInstr = AstInstr<'MovrInstr', Opcodes.MOVR> & {
  register1: Registers,
  register2: Registers,
};

export type StoiInstr = AstInstr<'StoiInstr', Opcodes.STOI> & {
  address: number,
  immediate: number,
};

export type StoibInstr = AstInstr<'StoibInstr', Opcodes.STOIB> & {
  address: number,
  immediate: number,
};

export type StoriInstr = AstInstr<'StoriInstr', Opcodes.STORI> & {
  register: Registers,
  immediate: number,
};

export type StoribInstr = AstInstr<'StoribInstr', Opcodes.STORIB> & {
  register: Registers,
  immediate: number,
};

export type StorInstr = AstInstr<'StorInstr', Opcodes.STOR> & {
  address: number,
  register: Registers,
};

export type StorbInstr = AstInstr<'StorbInstr', Opcodes.STORB> & {
  address: number,
  register: Registers,
};

export type StorrInstr = AstInstr<'StorrInstr', Opcodes.STORR> & {
  register1: Registers,
  register2: Registers,
};

export type StorrbInstr = AstInstr<'StorrbInstr', Opcodes.STORRB> & {
  register1: Registers,
  register2: Registers,
};

export type LodrInstr = AstInstr<'LodrInstr', Opcodes.LODR> & {
  register: Registers,
  address: number,
};

export type LodrbInstr = AstInstr<'LodrbInstr', Opcodes.LODRB> & {
  register: Registers,
  address: number,
};

export type LodrrInstr = AstInstr<'LodrrInstr', Opcodes.LODRR> & {
  register1: Registers,
  register2: Registers,
};

export type LodrrbInstr = AstInstr<'LodrrbInstr', Opcodes.LODRRB> & {
  register1: Registers,
  register2: Registers,
};

export type JmpiInstr = AstInstr<'JmpiInstr', Opcodes.JMPI> & {
  address: number,
};

export type Instr =
    NopInstr |
    EndInstr |
    VsyncInstr |
    MoviInstr |
    MovrInstr |
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
    LodrrbInstr |
    JmpiInstr;

export type Stmt = Instr;