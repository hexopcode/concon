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

export type JmpiInstr = AstInstr<'JmpiInstr', Opcodes.JMPI> & {
  address: number,
};

export type Instr =
    NopInstr |
    EndInstr |
    VsyncInstr |
    MoviInstr |
    JmpiInstr;

export type Stmt = Instr;