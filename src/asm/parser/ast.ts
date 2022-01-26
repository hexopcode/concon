import {Opcodes} from '../../core';

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

export type Instr =
    NopInstr |
    EndInstr |
    VsyncInstr;

export type Stmt = Instr;