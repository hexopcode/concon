import {assert, unreachable} from '../lib';
import {create_os_image} from '../os';
import {
  MAX_VALUE,
  MIN_VALUE,
  MEMORY_OS_SIZE,
  MEMORY_OS_OFFSET,
  MEMORY_PROGRAM_OFFSET,
  MEMORY_PROGRAM_SIZE,
  MEMORY_SCREEN_OFFSET,
  MEMORY_SCREEN_SIZE,
  MEMORY_SIZE,
  REGISTER_COUNT,
  Flags,
  MemoryArea,
  Registers,
} from './arch';
import {Opcodes} from './opcodes';

export enum Result {
  VSYNC,
  END,
}

export class System {
  private readonly buffer: ArrayBuffer;
  private readonly memory: Uint8Array;
  private readonly memoryAreas: Map<MemoryArea, Uint8Array>;
  private readonly registers: Uint16Array;

  constructor() {
    this.buffer = new ArrayBuffer(MEMORY_SIZE);
    this.memory = new Uint8Array(this.buffer);
    this.memoryAreas = new Map([
      [MemoryArea.OS, new Uint8Array(this.buffer, MEMORY_OS_OFFSET, MEMORY_OS_SIZE)],
      [MemoryArea.SCREEN, new Uint8Array(this.buffer, MEMORY_SCREEN_OFFSET, MEMORY_SCREEN_SIZE)],
      [MemoryArea.PROGRAM, new Uint8Array(this.buffer, MEMORY_PROGRAM_OFFSET, MEMORY_PROGRAM_SIZE)],
    ]);
    this.registers = new Uint16Array(REGISTER_COUNT);
  }

  reset() {
    this.memory.fill(0x00);
    this.registers.fill(0x00);
    this.loadOperatingSystem();
  }

  private loadOperatingSystem() {
    this.memory.set(create_os_image(), MEMORY_OS_OFFSET);
  }

  loadProgram(program: Uint8Array) {
    assert(program.length < MEMORY_PROGRAM_SIZE, `program too large: ${program.length} bytes`);
    this.memory.set(program, MEMORY_PROGRAM_OFFSET);
  }

  memoryArea(area: MemoryArea): Uint8Array {
    return this.memoryAreas.get(area)!;
  }

  debug(query: Registers): number {
    return this.registers[query];
  }

  debugMem(start: number, length: number = 1): Uint8Array {
    return new Uint8Array(this.buffer, start, length);
  }

  boot(): Result {
    this.registers[Registers.RIP] = MEMORY_OS_OFFSET;
    return this.cycle();
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
        case Opcodes.MOVR:
          this.movr();
          continue next;
        case Opcodes.STOI:
          this.stoi();
          continue next;
        case Opcodes.STOIB:
          this.stoib();
          continue next;
        case Opcodes.STORI:
          this.stori();
          continue next;
        case Opcodes.STORIB:
          this.storib();
          continue next;
        case Opcodes.STOR:
          this.stor();
          continue next;
        case Opcodes.STORB:
          this.storb();
          continue next;
        case Opcodes.STORR:
          this.storr();
          continue next;
        case Opcodes.STORRB:
          this.storrb();
          continue next;
        case Opcodes.LODR:
          this.lodr();
          continue next;
        case Opcodes.LODRB:
          this.lodrb();
          continue next;
        case Opcodes.LODRR:
          this.lodrr();
          continue next;
        case Opcodes.LODRRB:
          this.lodrrb();
          continue next;
        case Opcodes.ADDI:
          this.addi();
          continue next;
        case Opcodes.ADDR:
          this.addr();
          continue next;
        case Opcodes.SUBI:
          this.subi();
          continue next;
        case Opcodes.SUBR:
          this.subr();
          continue next;
        case Opcodes.MULI:
          this.muli();
          continue next;
        case Opcodes.MULR:
          this.mulr();
          continue next;
        case Opcodes.DIVI:
          this.divi();
          continue next;
        case Opcodes.DIVR:
          this.divr();
          continue next;
        case Opcodes.MODI:
          this.modi();
          continue next;
        case Opcodes.MODR:
          this.modr();
          continue next;
        case Opcodes.INC:
          this.inc();
          continue next;
        case Opcodes.DEC:
          this.dec();
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

  private address(): number {
    return this.immediate();
  }

  private checkMemoryBoundary(addr: number) {
    if (addr >= this.memory.length) {
      throw new Error('Invalid memory access: reached past the end of memory area.');
    }
  }

  private setRegisterAndFlags(reg: Registers, value: number) {
    this.registers[Registers.RFL] = 0;

    if (value > MAX_VALUE) {
      this.registers[reg] = MAX_VALUE;
      this.registers[Registers.RFL] = 1 << Flags.OVERFLOW;
    } else if (value == 0) {
      this.registers[reg] = 0;
      this.registers[Registers.RFL] = 1 << Flags.ZERO;
    } else if (value < MIN_VALUE) {
      this.registers[reg] = MIN_VALUE;
      this.registers[Registers.RFL] = 1 << Flags.NEGATIVE;
    } else {
      this.registers[reg] = value;
    }
  }

  private byte(): number {
    const rip = this.registers[Registers.RIP];
    // FIXME: automate this with a proxy around the memory object
    this.checkMemoryBoundary(rip);
    const byte = this.memory[rip];
    this.registers[Registers.RIP] = rip + 1;
    return byte;
  }

  private movi() {
    const register = this.register();
    const immediate = this.immediate();
    this.registers[register] = immediate;
  }

  private movr() {
    const reg1 = this.register();
    const reg2 = this.register();
    this.registers[reg1] = this.registers[reg2];
  }

  private stoi() {
    const addr = this.address();
    const imm = this.immediate();
    this.checkMemoryBoundary(addr + 1);
    this.memory[addr] = imm >> 8;
    this.memory[addr + 1] = imm & 0xff;
  }

  private stoib() {
    const addr = this.address();
    const imm = this.immediate();
    this.checkMemoryBoundary(addr);
    this.memory[addr] = imm & 0xff;
  }

  private stori() {
    const reg = this.register();
    const addr  = this.registers[reg];
    const imm = this.immediate();
    this.checkMemoryBoundary(addr + 1);
    this.memory[addr] = imm >> 8;
    this.memory[addr + 1] = imm & 0xff;
  }

  private storib() {
    const reg = this.register();
    const addr  = this.registers[reg];
    const imm = this.immediate();
    this.checkMemoryBoundary(addr);
    this.memory[addr] = imm & 0xff;
  }

  private stor() {
    const addr = this.address();
    const reg = this.register();
    const imm = this.registers[reg];
    this.checkMemoryBoundary(addr + 1);
    this.memory[addr] = imm >> 8;
    this.memory[addr + 1] = imm & 0xff;
  }

  private storb() {
    const addr = this.address();
    const reg = this.register();
    const imm = this.registers[reg];
    this.checkMemoryBoundary(addr);
    this.memory[addr] = imm & 0xff;
  }

  private storr() {
    const reg1 = this.register();
    const addr = this.registers[reg1];
    const reg2 = this.register();
    const imm = this.registers[reg2];
    this.checkMemoryBoundary(addr + 1);
    this.memory[addr] = imm >> 8;
    this.memory[addr + 1] = imm & 0xff;
  }

  private storrb() {
    const reg1 = this.register();
    const addr = this.registers[reg1];
    const reg2 = this.register();
    const imm = this.registers[reg2];
    this.checkMemoryBoundary(addr);
    this.memory[addr] = imm & 0xff;
  }

  private lodr() {
    const reg = this.register();
    const addr = this.address();
    this.checkMemoryBoundary(addr + 1);
    const imm = this.memory[addr] << 8 | this.memory[addr + 1];
    this.registers[reg] = imm;
  }

  private lodrb() {
    const reg = this.register();
    const addr = this.address();
    this.checkMemoryBoundary(addr);
    const imm = this.memory[addr];
    this.registers[reg] = imm;
  }

  private lodrr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const addr = this.registers[reg2];
    this.checkMemoryBoundary(addr + 1);
    const imm = this.memory[addr] << 8 | this.memory[addr + 1];
    this.registers[reg1] = imm;
  }

  private lodrrb() {
    const reg1 = this.register();
    const reg2 = this.register();
    const addr = this.registers[reg2];
    this.checkMemoryBoundary(addr);
    const imm = this.memory[addr];
    this.registers[reg1] = imm;
  }

  private addi() {
    const reg = this.register();
    const imm = this.immediate();
    const value = this.registers[reg] + imm;
    this.setRegisterAndFlags(reg, value);
  }

  private addr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const value = this.registers[reg1] + this.registers[reg2];
    this.setRegisterAndFlags(reg1, value);
  }

  private subi() {
    const reg = this.register();
    const imm = this.immediate();
    const value = this.registers[reg] - imm;
    this.setRegisterAndFlags(reg, value);
  }

  private subr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const value = this.registers[reg1] - this.registers[reg2];
    this.setRegisterAndFlags(reg1, value);
  }

  private muli() {
    const reg = this.register();
    const imm = this.immediate();
    const value = this.registers[reg] * imm;
    this.setRegisterAndFlags(reg, value);
  }

  private mulr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const value = this.registers[reg1] * this.registers[reg2];
    this.setRegisterAndFlags(reg1, value);
  }

  private divi() {
    const reg = this.register();
    const imm = this.immediate();
    if (imm == 0) {
      this.registers[Registers.RFL] = 1 << Flags.DIVBYZERO;
    } else {
      const value = this.registers[reg] / imm | 0;
      this.setRegisterAndFlags(reg, value);
    }
  }

  private divr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const imm = this.registers[reg2];
    if (imm == 0) {
      this.registers[Registers.RFL] = 1 << Flags.DIVBYZERO;
    } else {
      const value = this.registers[reg1] / imm | 0;
      this.setRegisterAndFlags(reg1, value);
    }
  }

  private modi() {
    const reg = this.register();
    const imm = this.immediate();
    if (imm == 0) {
      this.registers[Registers.RFL] = 1 << Flags.DIVBYZERO;
    } else {
      const value = this.registers[reg] % imm;
      this.setRegisterAndFlags(reg, value);
    }
  }

  private modr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const imm = this.registers[reg2];
    if (imm == 0) {
      this.registers[Registers.RFL] = 1 << Flags.DIVBYZERO;
    } else {
      const value = this.registers[reg1] % imm;
      this.setRegisterAndFlags(reg1, value);
    }
  }

  private inc() {
    const reg = this.register();
    const imm = this.registers[reg];
    this.setRegisterAndFlags(reg, imm + 1);
  }

  private dec() {
    const reg = this.register();
    const imm = this.registers[reg];
    this.setRegisterAndFlags(reg, imm - 1);
  }

  private jmpi() {
    const addr = this.address();
    this.registers[Registers.RIP] = addr;
  }
}