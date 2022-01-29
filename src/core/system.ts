import {assert, unreachable} from '../lib';
import {create_os_image} from '../os';
import {
  MEMORY_OS_OFFSET,
  MEMORY_PROGRAM_OFFSET,
  MEMORY_PROGRAM_SIZE,
  MEMORY_SIZE,
  REGISTER_COUNT,
  Registers,
} from './arch';
import {Opcodes} from './opcodes';

export enum Result {
  VSYNC,
  END,
}

export class System {
  private readonly memory: Uint8Array;
  private readonly registers: Uint16Array;

  constructor() {
    this.memory = new Uint8Array(MEMORY_SIZE);
    this.registers = new Uint16Array(REGISTER_COUNT);
  }

  reset() {
    this.memory.fill(0x00);
    this.registers.fill(0x00);
    this.loadOperatingSystem();
  }

  loadOperatingSystem() {
    this.memory.set(create_os_image(), MEMORY_OS_OFFSET);
  }

  loadProgram(program: Uint8Array) {
    assert(program.length < MEMORY_PROGRAM_SIZE, `program too large: ${program.length} bytes`);
    this.memory.set(program, MEMORY_PROGRAM_OFFSET);
  }

  debug(query: Registers): number {
    return this.registers[query];
  }

  debugMem(start: number, length: number = 1): Uint8Array {
    return this.memory.slice(start, start + length);
  }

  boot() {
    this.registers[Registers.RIP] = MEMORY_OS_OFFSET;
    this.cycle();
  }

  cycle(): Result {
    next: for (let opcode: Opcodes = this.instruction();; opcode = this.instruction()) {
      switch (opcode) {
        case Opcodes.NOP:
          continue next;
        case Opcodes.END:
          return Result.END;
        case Opcodes.VSYNC:
          return Result.VSYNC;
        case Opcodes.MOVI:
          this.movi();
          continue next;
        case Opcodes.JMPI:
          this.jmpi();
          continue next;
        default:
          unreachable(`Unimplemented opcode: ${opcode}`);
      }
    }
  }

  private instruction(): Opcodes {
    return this.byte() as Opcodes;
  }

  private register(): Registers {
    return this.byte() as Registers;
  }

  private immediate(): number {
    const hi = this.byte();
    const lo = this.byte();
    return hi << 8 | lo;
  }

  private byte(): number {
    const rip = this.registers[Registers.RIP];
    const byte = this.memory[rip];
    this.registers[Registers.RIP] = rip + 1;
    return byte;
  }

  private movi() {
    const register = this.register();
    const immediate = this.immediate();
    this.registers[register] = immediate;
  }

  private jmpi() {
    const addr = this.immediate();
    // TODO: check for boundaries
    this.registers[Registers.RIP] = addr;
  }
}