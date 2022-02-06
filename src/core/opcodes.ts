export enum Opcodes {
  // Core
  NOP = 0x00,
  END = 0x01,
  VSYNC = 0x02,

  // Memory
  MOVI = 0x10,
  MOVR = 0x11,
  STOI = 0x12,
  STOIB = 0x13,
  STORI = 0x14,
  STORIB = 0x15,
  STOR = 0x16,
  STORB = 0x17,
  STORR = 0x18,
  STORRB = 0x19,
  LODR = 0x1A,
  LODRB = 0x1B,
  LODRR = 0x1C,
  LODRRB = 0x1D,

  // Arithmetic
  ADDI = 0x20,
  ADDR = 0x21,
  SUBI = 0x22,
  SUBR = 0x23,
  MULI = 0x24,
  MULR = 0x25,
  DIVI = 0x26,
  DIVR = 0x27,
  MODI = 0x28,
  MODR = 0x29,
  INC = 0x2A,
  DEC = 0x2B,

  // Logic
  SHLI = 0x30,
  SHLR = 0x31,
  SHRI = 0x32,
  SHRR = 0x33,
  ORI = 0x34,
  ORR = 0x35,
  ANDI = 0x36,
  ANDR = 0x37,
  XORI = 0x38,
  XORR = 0x39,
  NOT = 0x3A,

  // Comparison
  CMPI = 0x40,
  CMPR = 0x41,

  // Jump
  JMP = 0x50,
  JMPR = 0x51,
  JZ = 0x52,
  JZR = 0x53,
  JNZ = 0x54,
  JNZR = 0x55,
  JG = 0x56,
  JGR = 0x57,
  JGZ = 0x58,
  JGZR = 0x59,
  JL = 0x5A,
  JLR = 0x5B,
  JLZ = 0x5C,
  JLZR = 0x5D,
  JO = 0x5E,
  JOR = 0x5F,
  JDZ = 0x60,
  JDZR = 0x61,
}