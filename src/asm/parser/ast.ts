import {Registers} from '../../core';

export type Address = number|string;

type AstNode<Type extends string> = {
  type: Type,
  line: number,
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
export type MoviInstr = AstRegImmInstr<'MoviInstr'>;
export type MovrInstr = AstRegRegInstr<'MovrInstr'>;
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

export type AddiInstr = AstRegImmInstr<'AddiInstr'>;
export type AddrInstr = AstRegRegInstr<'AddrInstr'>;
export type SubiInstr = AstRegImmInstr<'SubiInstr'>;
export type SubrInstr = AstRegRegInstr<'SubrInstr'>;
export type MuliInstr = AstRegImmInstr<'MuliInstr'>;
export type MulrInstr = AstRegRegInstr<'MulrInstr'>;
export type DiviInstr = AstRegImmInstr<'DiviInstr'>;
export type DivrInstr = AstRegRegInstr<'DivrInstr'>;
export type ModiInstr = AstRegImmInstr<'ModiInstr'>;
export type ModrInstr = AstRegRegInstr<'ModrInstr'>;
export type IncInstr = AstRegInstr<'IncInstr'>;
export type DecInstr = AstRegInstr<'DecInstr'>;

export type ShliInstr = AstRegImmInstr<'ShliInstr'>;
export type ShlrInstr = AstRegRegInstr<'ShlrInstr'>;
export type ShriInstr = AstRegImmInstr<'ShriInstr'>;
export type ShrrInstr = AstRegRegInstr<'ShrrInstr'>;
export type OriInstr = AstRegImmInstr<'OriInstr'>;
export type OrrInstr = AstRegRegInstr<'OrrInstr'>;
export type AndiInstr = AstRegImmInstr<'AndiInstr'>;
export type AndrInstr = AstRegRegInstr<'AndrInstr'>;
export type XoriInstr = AstRegImmInstr<'XoriInstr'>;
export type XorrInstr = AstRegRegInstr<'XorrInstr'>;
export type NotInstr = AstRegInstr<'NotInstr'>;

export type CmpiInstr = AstRegImmInstr<'CmpiInstr'>;
export type CmprInstr = AstRegRegInstr<'CmprInstr'>;

export type JmpiInstr = AstAddrInstr<'JmpiInstr'>;

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

export type CompareInstr = CmpiInstr |
    CmprInstr;

export type Instr = CoreInstr |
    MemoryInstr |
    ArithmeticInstr |
    LogicInstr |
    CompareInstr |
    JmpiInstr;

export type Label = AstNode<'Label'> & {
  label: string,
};

export type Stmt = Instr | Label;

export type Ast = Stmt[];