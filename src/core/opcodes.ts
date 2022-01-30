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

  // Jump
  JMPI = 0x50,
}