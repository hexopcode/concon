import {Opcodes, Registers} from '../../core';

export type NopInstr = {
  type: 'NopInstr',
  opcode: Opcodes.NOP,
  line: number,
};

export type EndInstr = {
  type: 'EndInstr',
  opcode: Opcodes.END,
  line: number,
};

export type VsyncInstr = {
  type: 'VsyncInstr',
  opcode: Opcodes.VSYNC,
  line: number,
};

export type MoviInstr = {
  type: 'MoviInstr',
  opcode: Opcodes.MOVI,
  line: number,
  register: Registers,
  immediate: number,
};

export type JmpiInstr = {
  type: 'JmpiInstr',
  opcode: Opcodes.JMPI,
  line: number,
  address: number,
};

export type Instr =
    NopInstr |
    EndInstr |
    VsyncInstr |
    MoviInstr |
    JmpiInstr;

export type Stmt = Instr;