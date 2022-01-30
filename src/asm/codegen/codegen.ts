import {Opcodes, Registers} from '../../core';
import {unreachable} from '../../lib';
import {AsmErrorCollector} from '../base';
import {Stmt} from '../parser';

export function codegen(ast: Stmt[], collectError: AsmErrorCollector) {
  return new Codegen(ast, collectError).codegen();
}

class Codegen {
  private readonly ast: Stmt[];
  private readonly collectError: AsmErrorCollector;

  constructor(ast: Stmt[], collectError: AsmErrorCollector) {
    this.ast = ast;
    this.collectError = collectError;
  }

  codegen(): Uint8Array {
    const bytes: number[] = [];

    for (const stmt of this.ast) {
      try {
        switch (stmt.type) {
          case 'NopInstr':
          case 'EndInstr':
          case 'VsyncInstr':
            bytes.push(stmt.opcode);
            break;
          case 'MoviInstr':
            bytes.push(...this.movi(stmt.register, stmt.immediate));
            break;
          case 'MovrInstr':
            bytes.push(Opcodes.MOVR, stmt.register1, stmt.register2);
            break;
          case 'StoiInstr':
            bytes.push(Opcodes.STOI, ...this.word(stmt.address), ...this.word(stmt.immediate));
            break;
          case 'StoibInstr':
            bytes.push(Opcodes.STOIB, ...this.word(stmt.address), ...this.word(stmt.immediate));
            break;
          case 'StoriInstr':
            bytes.push(Opcodes.STORI, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'StoribInstr':
            bytes.push(Opcodes.STORIB, stmt.register, ...this.word(stmt.immediate));
            break;
          case 'StorInstr':
            bytes.push(Opcodes.STOR, ...this.word(stmt.address), stmt.register);
            break;
          case 'StorbInstr':
            bytes.push(Opcodes.STORB, ...this.word(stmt.address), stmt.register);
            break;
          case 'StorrInstr':
            bytes.push(Opcodes.STORR, stmt.register1, stmt.register2);
            break;
          case 'StorrbInstr':
            bytes.push(Opcodes.STORRB, stmt.register1, stmt.register2);
            break;
          case 'LodrInstr':
            bytes.push(Opcodes.LODR, stmt.register, ...this.word(stmt.address));
            break;
          case 'LodrbInstr':
            bytes.push(Opcodes.LODRB, stmt.register, ...this.word(stmt.address));
            break;
          case 'LodrrInstr':
            bytes.push(Opcodes.LODRR, stmt.register1, stmt.register2);
            break;
          case 'LodrrbInstr':
            bytes.push(Opcodes.LODRRB, stmt.register1, stmt.register2);
            break;
          case 'JmpiInstr':
            bytes.push(...this.jmpi(stmt.address));
            break;
          default:
            unreachable(`Unsupported statement: ${stmt}`);
        }
      } catch (e) {
        this.collectError({
          line: stmt.line,
          message: (e as Error).message,
        });
      }
    }

    return new Uint8Array(bytes);
  }

  word(n: number): number[] {
    return [n >> 8, n & 0xff];
  }

  movi(register: Registers, immediate: number): number[] {
    switch (register) {
      case Registers.RIP:
      case Registers.RFL:
      case Registers.RIN:
        throw new Error(`Cannot set value for register ${Registers[register]}`);
      default:
        return [Opcodes.MOVI, register, ...this.word(immediate)];
    }
  }

  jmpi(address: number): number[] {
    // TODO: add support for labels
    return [Opcodes.JMPI, ...this.word(address)];
  }
}