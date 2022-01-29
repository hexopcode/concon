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
}