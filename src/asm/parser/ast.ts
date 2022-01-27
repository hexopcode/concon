import {Opcodes, Registers} from '../../core';

export type NopInstr = {
  type: 'NopInstr',
  opcode: Opcodes.NOP,
};

export type EndInstr = {
  type: 'EndInstr',
  opcode: Opcodes.END,
};

export type VsyncInstr = {
  type: 'VsyncInstr',
  opcode: Opcodes.VSYNC,
};

export type MoviInstr = {
  type: 'MoviInstr',
  opcode: Opcodes.MOVI,
  register: Registers,
  immediate: number,
}

export type Instr =
    NopInstr |
    EndInstr |
    VsyncInstr |
    MoviInstr;

export type Stmt = Instr;