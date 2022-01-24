import {assert, unreachable} from '../lib';
import {
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
    // TODO: burn OS
  }

  loadProgram(program: Uint8Array) {
    assert(program.length < MEMORY_PROGRAM_SIZE, `program too large: ${program.length} bytes`);
    this.memory.set(program, MEMORY_PROGRAM_OFFSET);
  }

  boot() {
    // TODO: run OS
    this.registers[Registers.RIP] = MEMORY_PROGRAM_OFFSET;
  }

  cycle(): Result {
    next: for (let opcode: Opcodes = this.instruction();; opcode = this.instruction()) {
      console.log(opcode);
      switch (opcode) {
        case Opcodes.NOP:
          continue next;
        case Opcodes.END:
          return Result.END;
        case Opcodes.VSYNC:
          return Result.VSYNC;
        default:
          unreachable(`Unimplemented opcode: ${opcode}`);
      }
    }
  }

  private instruction(): Opcodes {
    const rip = this.registers[Registers.RIP];
    const opcode = this.memory[rip] as Opcodes;
    this.registers[Registers.RIP] = rip + 1;
    return opcode;
  }

  private isResult(opcode: Opcodes): boolean {
    return opcode == Opcodes.VSYNC || opcode == Opcodes.END;
  }
}