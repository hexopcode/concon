import {REGISTER_GENERAL_COUNT} from './arch';
import {assert, SegFaultError, unreachable} from '../lib';
import {create_os_image} from '../os';
import {
  MAX_VALUE,
  MIN_VALUE,
  MEMORY_OS_SIZE,
  MEMORY_OS_OFFSET,
  MEMORY_PROGRAM_OFFSET,
  MEMORY_PROGRAM_SIZE,
  MEMORY_FRAMEBUFFER_OFFSET,
  MEMORY_FRAMEBUFFER_SIZE,
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
  BRK,
  SEGFAULT,
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
      [MemoryArea.FRAMEBUFFER, new Uint8Array(this.buffer, MEMORY_FRAMEBUFFER_OFFSET, MEMORY_FRAMEBUFFER_SIZE)],
      [MemoryArea.PROGRAM, new Uint8Array(this.buffer, MEMORY_PROGRAM_OFFSET, MEMORY_PROGRAM_SIZE)],
    ]);
    this.registers = new Uint16Array(REGISTER_COUNT);

    this.reset();
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
    try {
      return this.cycleInternal();
    } catch (e) {
      if (e instanceof SegFaultError) {
        return Result.SEGFAULT;
      }
      throw e;
    }
  }

  private cycleInternal(): Result {
    for (let opcode: Opcodes = this.instruction();; opcode = this.instruction()) {
      switch (opcode) {
        case Opcodes.NOP:
          break;
        case Opcodes.END:
          return Result.END;
        case Opcodes.VSYNC:
          return Result.VSYNC;
        case Opcodes.BRK:
          return Result.BRK;

        case Opcodes.MOVI:
          this.movi();
          break;
        case Opcodes.MOVR:
          this.movr();
          break;
        case Opcodes.STOI:
          this.stoi();
          break;
        case Opcodes.STOIB:
          this.stoib();
          break;
        case Opcodes.STORI:
          this.stori();
          break;
        case Opcodes.STORIB:
          this.storib();
          break;
        case Opcodes.STOR:
          this.stor();
          break;
        case Opcodes.STORB:
          this.storb();
          break;
        case Opcodes.STORR:
          this.storr();
          break;
        case Opcodes.STORRB:
          this.storrb();
          break;
        case Opcodes.LODR:
          this.lodr();
          break;
        case Opcodes.LODRB:
          this.lodrb();
          break;
        case Opcodes.LODRR:
          this.lodrr();
          break;
        case Opcodes.LODRRB:
          this.lodrrb();
          break;

        case Opcodes.ADDI:
          this.addi();
          break;
        case Opcodes.ADDR:
          this.addr();
          break;
        case Opcodes.SUBI:
          this.subi();
          break;
        case Opcodes.SUBR:
          this.subr();
          break;
        case Opcodes.MULI:
          this.muli();
          break;
        case Opcodes.MULR:
          this.mulr();
          break;
        case Opcodes.DIVI:
          this.divi();
          break;
        case Opcodes.DIVR:
          this.divr();
          break;
        case Opcodes.MODI:
          this.modi();
          break;
        case Opcodes.MODR:
          this.modr();
          break;
        case Opcodes.INC:
          this.inc();
          break;
        case Opcodes.DEC:
          this.dec();
          break;

        case Opcodes.SHLI:
          this.shli();
          break;
        case Opcodes.SHLR:
          this.shlr();
          break;
        case Opcodes.SHRI:
          this.shri();
          break;
        case Opcodes.SHRR:
          this.shrr();
          break;
        case Opcodes.ORI:
          this.ori();
          break;
        case Opcodes.ORR:
          this.orr();
          break;
        case Opcodes.ANDI:
          this.andi();
          break;
        case Opcodes.ANDR:
          this.andr();
          break;
        case Opcodes.XORI:
          this.xori();
          break;
        case Opcodes.XORR:
          this.xorr();
          break;
        case Opcodes.NOT:
          this.not();
          break;
          
        case Opcodes.CMPI:
          this.cmpi();
          break;
        case Opcodes.CMPR:
          this.cmpr();
          break;

        case Opcodes.JMP:
          this.jmp();
          break;
        case Opcodes.JMPR:
          this.jmpr();
          break;
        case Opcodes.JZ:
          this.jz();
          break;
        case Opcodes.JZR:
          this.jzr();
          break;
        case Opcodes.JNZ:
          this.jnz();
          break;
        case Opcodes.JNZR:
          this.jnzr();
          break;
        case Opcodes.JG:
          this.jg();
          break;
        case Opcodes.JGR:
          this.jgr();
          break;
        case Opcodes.JGZ:
          this.jgz();
          break;
        case Opcodes.JGZR:
          this.jgzr();
          break;
        case Opcodes.JL:
          this.jl();
          break;
        case Opcodes.JLR:
          this.jlr();
          break;
        case Opcodes.JLZ:
          this.jlz();
          break;
        case Opcodes.JLZR:
          this.jlzr();
          break;
        case Opcodes.JO:
          this.jo();
          break;
        case Opcodes.JOR:
          this.jor();
          break;
        case Opcodes.JDZ:
          this.jdz();
          break;
        case Opcodes.JDZR:
          this.jdzr();
          break;
        case Opcodes.PUSHI:
          this.pushi();
          break;
        case Opcodes.PUSHR:
          this.pushr();
          break;
        case Opcodes.PUSHALLR:
          this.pushallr();
          break;
        case Opcodes.POPR:
          this.popr();
          break;
        case Opcodes.POPALLR:
          this.popallr();
          break;
        case Opcodes.CALL:
          this.call();
          break;
        case Opcodes.RET:
          this.ret();
          break;
        default:
          unreachable(`Unimplemented opcode: ${opcode}`);
      }
    }
  }

  private byte(): number {
    const rip = this.registers[Registers.RIP];
    this.checkMemoryBoundary(rip);
    const byte = this.memory[rip];
    this.registers[Registers.RIP] = rip + 1;
    return byte;
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
      throw new SegFaultError('Invalid memory access: reached past the end of memory area.');
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

  private isFlagSet(flag: Flags): boolean {
    return (this.registers[Registers.RFL] >> flag & 1) == 1;
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

  private shli() {
    const reg = this.register();
    const imm = this.immediate();
    const value = this.registers[reg] << imm;
    this.setRegisterAndFlags(reg, value);
  }

  private shlr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const imm = this.registers[reg2];
    const value = this.registers[reg1] << imm;
    this.setRegisterAndFlags(reg1, value);
  }

  private shri() {
    const reg = this.register();
    const imm = this.immediate();
    const value = this.registers[reg] >> imm;
    this.setRegisterAndFlags(reg, value);
  }

  private shrr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const imm = this.registers[reg2];
    const value = this.registers[reg1] >> imm;
    this.setRegisterAndFlags(reg1, value);
  }

  private ori() {
    const reg = this.register();
    const imm = this.immediate();
    const value = this.registers[reg] | imm;
    this.setRegisterAndFlags(reg, value);
  }

  private orr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const imm = this.registers[reg2];
    const value = this.registers[reg1] | imm;
    this.setRegisterAndFlags(reg1, value);
  }

  private andi() {
    const reg = this.register();
    const imm = this.immediate();
    const value = this.registers[reg] & imm;
    this.setRegisterAndFlags(reg, value);
  }

  private andr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const imm = this.registers[reg2];
    const value = this.registers[reg1] & imm;
    this.setRegisterAndFlags(reg1, value);
  }

  private xori() {
    const reg = this.register();
    const imm = this.immediate();
    const value = this.registers[reg] ^ imm;
    this.setRegisterAndFlags(reg, value);
  }

  private xorr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const imm = this.registers[reg2];
    const value = this.registers[reg1] ^ imm;
    this.setRegisterAndFlags(reg1, value);
  }

  private not() {
    const reg = this.register();
    const value = ((~this.registers[reg]) >>> 0) & MAX_VALUE;
    this.setRegisterAndFlags(reg, value);
  }

  private cmpi() {
    const reg = this.register();
    const imm = this.immediate();
    const value = this.registers[reg];

    this.registers[Registers.RFL] = 0;

    if (value < imm) {
      this.registers[Registers.RFL] = 1 << Flags.NEGATIVE;
    } else if (value == imm) {
      this.registers[Registers.RFL] = 1 << Flags.ZERO;
    }
  }

  private cmpr() {
    const reg1 = this.register();
    const reg2 = this.register();
    const imm = this.registers[reg2];
    const value = this.registers[reg1];

    this.registers[Registers.RFL] = 0;

    if (value < imm) {
      this.registers[Registers.RFL] = 1 << Flags.NEGATIVE;
    } else if (value == imm) {
      this.registers[Registers.RFL] = 1 << Flags.ZERO;
    }
  }

  private jmp() {
    const addr = this.address();
    this.registers[Registers.RIP] = addr;
  }

  private jmpr() {
    const reg = this.register();
    const addr = this.registers[reg];
    this.registers[Registers.RIP] = addr;
  }
  
  private jz() {
    const addr = this.address();

    if (this.isFlagSet(Flags.ZERO)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jzr() {
    const reg = this.register();
    const addr = this.registers[reg];

    if (this.isFlagSet(Flags.ZERO)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jnz() {
    const addr = this.address();

    if (!this.isFlagSet(Flags.ZERO)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jnzr() {
    const reg = this.register();
    const addr = this.registers[reg];

    if (!this.isFlagSet(Flags.ZERO)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jg() {
    const addr = this.address();

    if (!this.isFlagSet(Flags.ZERO) && !this.isFlagSet(Flags.NEGATIVE)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jgr() {
    const reg = this.register();
    const addr = this.registers[reg];

    if (!this.isFlagSet(Flags.ZERO) && !this.isFlagSet(Flags.NEGATIVE)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jgz() {
    const addr = this.address();

    if (!this.isFlagSet(Flags.NEGATIVE)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jgzr() {
    const reg = this.register();
    const addr = this.registers[reg];

    if (!this.isFlagSet(Flags.NEGATIVE)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jl() {
    const addr = this.address();

    if (!this.isFlagSet(Flags.ZERO) && this.isFlagSet(Flags.NEGATIVE)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jlr() {
    const reg = this.register();
    const addr = this.registers[reg];

    if (!this.isFlagSet(Flags.ZERO) && this.isFlagSet(Flags.NEGATIVE)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jlz() {
    const addr = this.address();

    if (this.isFlagSet(Flags.ZERO) || this.isFlagSet(Flags.NEGATIVE)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jlzr() {
    const reg = this.register();
    const addr = this.registers[reg];

    if (this.isFlagSet(Flags.ZERO) || this.isFlagSet(Flags.NEGATIVE)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jo() {
    const addr = this.address();

    if (this.isFlagSet(Flags.OVERFLOW)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jor() {
    const reg = this.register();
    const addr = this.registers[reg];

    if (this.isFlagSet(Flags.OVERFLOW)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jdz() {
    const addr = this.address();

    if (this.isFlagSet(Flags.DIVBYZERO)) {
      this.registers[Registers.RIP] = addr;
    }
  }
  
  private jdzr() {
    const reg = this.register();
    const addr = this.registers[reg];

    if (this.isFlagSet(Flags.DIVBYZERO)) {
      this.registers[Registers.RIP] = addr;
    }
  }

  private pushi() {
    const imm = this.immediate();
    const addr = this.registers[Registers.RSP];
    this.checkMemoryBoundary(addr + 1);
    this.memory[addr] = imm >> 8;
    this.memory[addr + 1] = imm & 0xFF;
    this.registers[Registers.RSP] = addr + 2;
  }

  private pushr() {
    const reg = this.register();
    const imm = this.registers[reg];
    const addr = this.registers[Registers.RSP];
    this.checkMemoryBoundary(addr + 1);
    this.memory[addr] = imm >> 8;
    this.memory[addr + 1] = imm & 0xFF;
    this.registers[Registers.RSP] = addr + 2;
  }

  private pushallr() {
    for (let r = 0; r < REGISTER_GENERAL_COUNT; ++r) {
      const imm = this.registers[r as Registers];
      const addr = this.registers[Registers.RSP];
      this.checkMemoryBoundary(addr + 1);
      this.memory[addr] = imm >> 8;
      this.memory[addr + 1] = imm & 0xFF;
      this.registers[Registers.RSP] = addr + 2;
    }
  }

  private popr() {
    this.registers[Registers.RSP] -= 2;
    const addr = this.registers[Registers.RSP];
    const hi = this.memory[addr];
    const lo = this.memory[addr + 1];
    const imm = hi << 8 | lo;
    const reg = this.register();
    this.registers[reg] = imm;
  }

  private popallr() {
    for (let r = REGISTER_GENERAL_COUNT - 1; r >= 0; --r) {
      this.registers[Registers.RSP] -= 2;
      const addr = this.registers[Registers.RSP];
      const hi = this.memory[addr];
      const lo = this.memory[addr + 1];
      const imm = hi << 8 | lo;
      this.registers[r] = imm;
    }
  }

  private call() {
    const imm = this.immediate();
    const ret = this.registers[Registers.RIP];

    const addr = this.registers[Registers.RSP];
    this.checkMemoryBoundary(addr + 1);
    this.memory[addr] = ret >> 8;
    this.memory[addr + 1] = ret & 0xFF;
    this.registers[Registers.RSP] = addr + 2;

    this.registers[Registers.RIP] = imm;
  }

  private ret() {
    this.registers[Registers.RSP] -= 2;
    const addr = this.registers[Registers.RSP];
    const hi = this.memory[addr];
    const lo = this.memory[addr + 1];
    const imm = hi << 8 | lo;

    this.registers[Registers.RIP] = imm;
  }
}