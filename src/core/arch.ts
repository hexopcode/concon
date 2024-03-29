export enum Registers {
  // General purpose
  R0 = 0x00,
  R1 = 0x01,
  R2 = 0x02,
  R3 = 0x03,
  R4 = 0x04,
  R5 = 0x05,
  R6 = 0x06,
  R7 = 0x07,
  R8 = 0x08,
  R9 = 0x09,
  R10 = 0x0A,
  R11 = 0x0B,
  R12 = 0x0C,
  R13 = 0x0D,
  R14 = 0x0E,
  R15 = 0x0F,

  // Instruction pointer
  RIP = 0x10,
  // Stack pointer
  RSP = 0x11,
  // Flags
  RFL = 0x12,
  // Inputs
  RIN = 0x13,
}

export const REGISTER_COUNT = Registers.RIN + 1;
export const REGISTER_GENERAL_COUNT = Registers.R15 + 1;

export const MAX_VALUE = 0xFFFF;
export const MIN_VALUE = 0x0000;

export enum Flags {
  ZERO = 0x00,
  NEGATIVE = 0x01,
  OVERFLOW = 0x02,
  DIVBYZERO = 0x03,
}

export enum Inputs {
  UP = 0x00,
  DOWN = 0x01,
  LEFT = 0x02,
  RIGHT = 0x03,
  BUTTON_1 = 0x04,
  BUTTON_2 = 0x05,
  START_PAUSE = 0x06,
  RESET = 0x07,
}

export enum MemoryArea {
  OS,
  FRAMEBUFFER,
  PROGRAM,
}

export const MEMORY_OS_OFFSET = 0x0000;
export const MEMORY_FRAMEBUFFER_OFFSET = 0x1000;
export const MEMORY_PROGRAM_OFFSET = 0x2000;

export const MEMORY_SIZE = 0xC000;
export const MEMORY_OS_SIZE = MEMORY_FRAMEBUFFER_OFFSET - MEMORY_OS_OFFSET;
export const MEMORY_FRAMEBUFFER_SIZE = MEMORY_PROGRAM_OFFSET - MEMORY_FRAMEBUFFER_OFFSET;
export const MEMORY_PROGRAM_SIZE = MEMORY_SIZE - MEMORY_PROGRAM_OFFSET;

export interface InputDevice {
  in: (data: number) => void;
  inb: (data: number) => void;
}

export interface OutputDevice {
  out: (data: number) => void;
  outb: (data: number) => void;
}

export type IoDevice = InputDevice | OutputDevice;