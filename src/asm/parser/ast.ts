import {Opcodes, Registers} from '../../core';

type AstNode<Type extends string> = {
  type: Type,
  line: number,
};

type AstInstr<Type extends string, Op extends Opcodes> = AstNode<Type> & {
  opcode: Op,
};

type AstRegImmInstr<Type extends string, Op extends Opcodes> = AstInstr<Type, Op> & {
  register: Registers,
  immediate: number,
};

type AstRegAddrInstr<Type extends string, Op extends Opcodes> = AstInstr<Type, Op> & {
  register: Registers,
  address: number,
};

type AstAddrImmInstr<Type extends string, Op extends Opcodes> = AstInstr<Type, Op> & {
  address: number,
  immediate: number,
};

type AstAddrRegInstr<Type extends string, Op extends Opcodes> = AstInstr<Type, Op> & {
  address: number,
  register: Registers,
};

type AstRegRegInstr<Type extends string, Op extends Opcodes> = AstInstr<Type, Op> & {
  register1: Registers,
  register2: Registers,
};

type AstRegInstr<Type extends string, Op extends Opcodes> = AstInstr<Type, Op> & {
  register: Registers,
};

type AstAddrInstr<Type extends string, Op extends Opcodes> = AstInstr<Type, Op> & {
  address: number,
};

export type NopInstr = AstInstr<'NopInstr', Opcodes.NOP>;
export type EndInstr = AstInstr<'EndInstr', Opcodes.END>;
export type VsyncInstr = AstInstr<'VsyncInstr', Opcodes.VSYNC>;
export type MoviInstr = AstRegImmInstr<'MoviInstr', Opcodes.MOVI>;
export type MovrInstr = AstRegRegInstr<'MovrInstr', Opcodes.MOVR>;
export type StoiInstr = AstAddrImmInstr<'StoiInstr', Opcodes.STOI>;
export type StoibInstr = AstAddrImmInstr<'StoibInstr', Opcodes.STOIB>;
export type StoriInstr = AstRegImmInstr<'StoriInstr', Opcodes.STORI>;
export type StoribInstr = AstRegImmInstr<'StoribInstr', Opcodes.STORIB>;
export type StorInstr = AstAddrRegInstr<'StorInstr', Opcodes.STOR>;
export type StorbInstr = AstAddrRegInstr<'StorbInstr', Opcodes.STORB>;
export type StorrInstr = AstRegRegInstr<'StorrInstr', Opcodes.STORR>;
export type StorrbInstr = AstRegRegInstr<'StorrbInstr', Opcodes.STORRB>;
export type LodrInstr = AstRegAddrInstr<'LodrInstr', Opcodes.LODR>;
export type LodrbInstr = AstRegAddrInstr<'LodrbInstr', Opcodes.LODRB>;
export type LodrrInstr = AstRegRegInstr<'LodrrInstr', Opcodes.LODRR>;
export type LodrrbInstr = AstRegRegInstr<'LodrrbInstr', Opcodes.LODRRB>;

export type AddiInstr = AstRegImmInstr<'AddiInstr', Opcodes.ADDI>;
export type AddrInstr = AstRegRegInstr<'AddrInstr', Opcodes.ADDR>;
export type SubiInstr = AstRegImmInstr<'SubiInstr', Opcodes.SUBI>;
export type SubrInstr = AstRegRegInstr<'SubrInstr', Opcodes.SUBR>;
export type MuliInstr = AstRegImmInstr<'MuliInstr', Opcodes.MULI>;
export type MulrInstr = AstRegRegInstr<'MulrInstr', Opcodes.MULR>;
export type DiviInstr = AstRegImmInstr<'DiviInstr', Opcodes.DIVI>;
export type DivrInstr = AstRegRegInstr<'DivrInstr', Opcodes.DIVR>;
export type ModiInstr = AstRegImmInstr<'ModiInstr', Opcodes.MODI>;
export type ModrInstr = AstRegRegInstr<'ModrInstr', Opcodes.MODR>;
export type IncInstr = AstRegInstr<'IncInstr', Opcodes.INC>;
export type DecInstr = AstRegInstr<'DecInstr', Opcodes.DEC>;

export type ShliInstr = AstRegImmInstr<'ShliInstr', Opcodes.SHLI>;
export type ShlrInstr = AstRegRegInstr<'ShlrInstr', Opcodes.SHLR>;
export type ShriInstr = AstRegImmInstr<'ShriInstr', Opcodes.SHRI>;
export type ShrrInstr = AstRegRegInstr<'ShrrInstr', Opcodes.SHRR>;
export type OriInstr = AstRegImmInstr<'OriInstr', Opcodes.ORI>;
export type OrrInstr = AstRegRegInstr<'OrrInstr', Opcodes.ORR>;
export type AndiInstr = AstRegImmInstr<'AndiInstr', Opcodes.ANDI>;
export type AndrInstr = AstRegRegInstr<'AndrInstr', Opcodes.ANDR>;
export type XoriInstr = AstRegImmInstr<'XoriInstr', Opcodes.XORI>;
export type XorrInstr = AstRegRegInstr<'XorrInstr', Opcodes.XORR>;
export type NotInstr = AstRegInstr<'NotInstr', Opcodes.NOT>;

export type JmpiInstr = AstAddrInstr<'JmpiInstr', Opcodes.JMPI>;

export type CoreInstr = NopInstr |
    EndInstr |
    VsyncInstr;

export type MemoryInstr = MoviInstr |
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
    LodrrbInstr;

export type ArithmeticInstr = AddiInstr |
    AddrInstr |
    SubiInstr |
    SubrInstr |
    MuliInstr |
    MulrInstr |
    DiviInstr |
    DivrInstr |
    ModiInstr |
    ModrInstr |
    IncInstr |
    DecInstr;

export type LogicInstr = ShliInstr |
    ShlrInstr |
    ShriInstr |
    ShrrInstr |
    OriInstr |
    OrrInstr |
    AndiInstr |
    AndrInstr |
    XoriInstr |
    XorrInstr |
    NotInstr;

export type Instr = CoreInstr |
    MemoryInstr |
    ArithmeticInstr |
    LogicInstr |
    JmpiInstr;

export type Stmt = Instr;

export type Ast = Stmt[];